pipeline {
    environment {
        registry = "rampeand/portfolio"
        registryCredential = 'dockerhub'
    }

    agent none
    
    stages {
        stage('Stop containers') {
            agent {
                 label 'master'
            }
            steps {
                script{
                     try{
                        sh 'docker stop portfolio'
                    }catch (err) {

                    }
                    try{
                        sh 'docker rm portfolio'
                    }catch (err) {

                    }
                    try{
                        sh 'docker rmi portfolio_image'
                    }catch (err) {

                    }
                }
            }
        }
        stage('Create container and run tests') {
            agent {
                docker {
                    image 'node:10-alpine'
                    args '-p 80:80'
                }
            }   
            steps {
                checkout scm
                sh 'npm install mocha'
                sh 'npm test'
            }
        }
        stage('SCM checkout') {
             agent {
                 label 'master'
             }
             steps {   
                checkout scm
            }
        }
        stage('Inject credentials'){
            agent{
                label 'master'
            }
            steps{
                withCredentials([file(credentialsId: '54026027-505e-4cef-a768-27ef8abff427'	, variable: 'PORTFOLIO_ENV')]) {
                    sh 'rm .env -f'
                    sh 'cat $PORTFOLIO_ENV >> .env'
                }
            }
        }
        stage('Build image & deploy container'){
            agent{
                label 'master'
            }
            steps{
                sh 'docker build -t portfolio_image .'
                sh 'docker run --name portfolio -d -p 80:80 portfolio_image'
            }
        }
    }
}