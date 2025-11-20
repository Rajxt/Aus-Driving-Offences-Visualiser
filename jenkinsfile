pipeline {
    agent any
    
    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning Vue.js app from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image for Vue.js app...'
                script {
                    sh 'docker build -t vue-vite-app:latest .'
                }
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo 'Stopping old container...'
                script {
                    sh 'docker stop vue-app || true'
                    sh 'docker rm vue-app || true'
                }
            }
        }
        
        stage('Run New Container') {
            steps {
                echo 'Running new Vue.js container...'
                script {
                    // Run on port 80 (or 8080 if you prefer)
                    sh 'docker run -d --name vue-app -p 80:80 vue-vite-app:latest'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Checking if container is running...'
                sh 'docker ps | grep vue-app'
                sh 'sleep 5'
                sh 'curl -f http://localhost:80 || exit 1'
            }
        }
    }
    
    post {
        success {
            echo '✅ Vue.js app deployed successfully!'
        }
        failure {
            echo '❌ Deployment failed!'
            sh 'docker logs vue-app || true'
        }
    }
}