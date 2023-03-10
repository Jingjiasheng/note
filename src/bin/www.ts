import path from "path";

import express from "express";
import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { ulid } from "ulid";
import { hashSync, compareSync } from "bcrypt";
import { json } from "body-parser";

import { Note } from "../model/note";
import { User } from "../model/user";
import { initDb } from "../init/init_db";

const app = express();
const jsonBodyParser = json();

const USER_TOKEN = new Map<string, string>();
const USER_PWD_ERROR_TIMES = new Map<string, number>();
const SHARE_IDS = new Map<string, Date>();


(async (): Promise<void> => {

  await initDb();

  console.log(process.env.DB_PATH);

  // 设置静态资源目录
  app.use(express.static(path.join(__dirname, "../static")));


  // 处理用户的登录请求
  app.post("/login", jsonBodyParser, async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    // 检查用户的 email 是否正确
    if (!new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)) {
      return res.status(200).json({ code: 400104, message: "邮箱格式错误" });
    }
    // 检查 email 是否存在
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ code: 400100, message: "该邮箱尚未注册账号，请先注册！" });
    }
    if (!user.enabled) {
      return res.status(200).json({ code: 400101, message: "该邮箱目前被禁用，请联系管理员处理！" });
    }
    // 需要检查用户的密码是否正确
    if (!compareSync(password, user.password)) {
      USER_PWD_ERROR_TIMES.set(email, (USER_PWD_ERROR_TIMES.get(email) ?? 0) + 1);
      USER_PWD_ERROR_TIMES.get(email)! > 3
          ? await User.update( { enabled: false }, { where: { email: email } } )
          : (void 0);
      return res.status(200).json({ code: 400101, message: "该邮箱目前被禁用，请联系管理员处理！" });
    }
    USER_PWD_ERROR_TIMES.set(email, 0);
    // 不管用户之前token是否过期直接新签一个 token 对其进行设置
    const token = jwt.sign(
      { sub: user.id },
      process.env.TOKEN_SIGN_SECRET ?? "note",
      { expiresIn: (process.env.TOKEN_EXPIRE ?? "12") + "h" }
    );
    USER_TOKEN.set(email, token);
    return res.status(200).json({ code: 200100, token: token });

  });

  // 处理用户的注册请求
  app.post("/signup", jsonBodyParser, async (req: Request, res: Response): Promise<Response | void> => {
    const email = req.body.email;
    const password = req.body.password;

    // 检查用户的 email 是否正确
    if (!new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)) {
      return res.status(200).json({ code: 400101, message: "邮箱格式错误" });
    }
    // 检查 email 是否存在
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(200).json({ code: 400100, message: "该邮箱已经被占用，请选择其他邮箱！" });
    }

    await new User({
      id: ulid(),
      email: email,
      password: hashSync(password, Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12")),
      enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    }).save();

    return res.status(200).json({ code: 200100, message:"注册成功，请联系管理员启用该账号" });

  });


  // 处理用户获取分享的内容的请求
  app.get("/share", jsonBodyParser, async (req: Request, res: Response): Promise<Response | void> => {
    const note_id = req.query.id as string;

    // 需要先检查这个ID是否处于分享的状态
    if (!SHARE_IDS.get(note_id) || (SHARE_IDS.get(note_id) && (SHARE_IDS.get(note_id)!) < new Date())) {
      return res.status(200).json({ code: 400103, message: "该分享便签已经失效，请重新分享" });
    }

    // 遍历一下所有的分享ID，如果过期了就要清除一下
    for (const [ id, due_date ] of SHARE_IDS.entries()) {
      console.log(id, "==>" , due_date);
      if (due_date < new Date()) {
        console.log(id, "-->" , due_date);
        SHARE_IDS.delete(id);
      }
    }

    const note = await Note.findOne({ where: { id: note_id } });
    return res.status(200).json({ code: 200100, data: note });
  });


  // 鉴权中间件
  app.use("/data", jsonBodyParser, (req: Request, res: Response, next: NextFunction) => {
    const token = req.get("token");
    if (!token) {
      return res.status(200).json({ code: 400100, message: "没有传入token" });
    }
    let payload;
    // 验证token
    try {
      payload = jwt.verify(token, process.env.TOKEN_SIGN_SECRET ?? "note") as { sub: string };
    }
    catch (error) {
      return res.status(200).json({ code: 400100, message: error.message });
      // return res.status(400).json({code: 400100, message: "token已经过期"})
    }
    // 验证成功之后将用户的 email 和 user_id 放置到 res中
    res.locals.user_id = payload.sub;
    next();
  });

  // 获取用户所有的数据
  app.get("/data", async (_req: Request, res: Response): Promise<Response | void> => {
    const user_id = res.locals.user_id as string;
    const notes = await Note.findAll({ where: { owner_id: user_id, is_deleted: false } });
    return res.status(200).json({ code: 200100, data: notes });
  });


  // 删除某个便笺的数据
  app.post("/data/delete", async (req: Request, res: Response): Promise<Response | void> => {
    const user_id = res.locals.user_id as string;
    const note_id = req.body.id as string;
    const notes = await Note.update({ is_deleted: true }, { where: { owner_id: user_id, id: note_id } });
    return res.status(200).json({ code: 200100, data: notes });
  });


  // 用户更新或者新建便笺
  app.post("/data", async (req: Request, res: Response) => {
    const user_id = res.locals.user_id as string;
    // 根据Note ID 判断该便笺是否存在，如果存在的话就获取，如果不存在的话就创建
    const note_id = req.body.id as string;
    const note_title = req.body.title as string;
    const note_bg = req.body.bg as string;
    const note_desc = req.body.desc as string;
    const note_detail = req.body.detail as string;

    const note: Note = note_id
        ? (await Note.findOne({ where: { id: note_id } }))!
        : new Note();
    !note_id && (note.id = ulid());
    note.owner_id = user_id;
    note_title && (note.title = note_title);
    note_bg && (note.bg = note_bg);
    note_desc && (note.desc = note_desc);
    note_detail && (note.detail = note_detail);

    await note.save();

    return res.status(200).json({ code: 200100, id: note.id });

  });


  // 处理用户分享ID
  app.post("/data/share", jsonBodyParser, (req: Request, res: Response): Response => {
    const note_id = req.body.id as string;
    SHARE_IDS.set(note_id,
      new Date(new Date().setSeconds(
        new Date().getSeconds() + Number.parseInt(process.env.SHARE_EXPIRE ?? "86400")
      ))
    );
    return res.status(200).json({ code: 200100, id: note_id });
  });


  app.listen(Number.parseInt(process.env.PORT ?? "3333"), () => {
    console.log("start success in port:", Number.parseInt(process.env.PORT ?? "3333"));
  });
})();
