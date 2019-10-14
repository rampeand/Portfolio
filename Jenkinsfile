pipeline {
    agent {
        docker {
            image 'node:10-alpine'
            args '-p 80:80'
        }
    }
    environment { 
        CI = 'true'
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh './jenkins/scripts/test.sh'
            }
        }
        stage('Deliver') { 
            steps {
                //deployment steps
                sh 'docker ps'
            }
        }
    }
}