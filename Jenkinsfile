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
                sh 'docker stop portfolio'
                sh 'docker rm portfolio'
                sh 'docker rmi portfolio_image'
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
                    sh 'rm .env'
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
        stage('Building image for registry') {
            steps{
                script {
                    dockerImage = docker.build registry + ":$BUILD_NUMBER"
                }
            }
        }
        stage('Deploying image to registry') {
            steps{
                script {
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
        stage('Remove unused docker image') {
            agent {
                 label 'master'
             }
            steps{
                sh "docker rmi $registry:$BUILD_NUMBER"
            }
        }
    }
}