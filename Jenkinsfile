pipeline{
    agent any
    tools{
        nodejs 'node18'
    }
    stages{
        stage('pull code'){
            steps{
                sh 'echo $WORKSPACE && mkdir data && ls -al'
                git branch:'main',credentialsId:'NOTE-JENKINS',url:'git@github.com:Jingjiasheng/note.git'
            }
        }
        stage('project build'){
            steps{
                sh 'npm install ts-node --global'
                sh 'npm install'
            }
        }
        stage('run project'){
            steps{
                sh 'npm run start'
            }
        }
    }
}