pipeline {

    agent any

    stages {

        stage('Checkout') {

            steps {
                git branch: 'main',
                    url: 'https://github.com/YOUR_USERNAME/student-course-registration.git'
            }
        }

        stage('Backend Test') {

            steps {
                sh '''
                    cd backend
                    npm install
                    node --check server.js
                '''
            }
        }

        stage('Build Docker Image') {

            steps {
                sh '''
                    cd backend
                    docker build -t student-backend:latest .
                '''
            }
        }

        stage('Deploy Backend') {

            steps {

                sh '''
                    docker stop student-backend || true
                    docker rm student-backend || true

                    docker run -d \
                    --name student-backend \
                    -p 5000:5000 \
                    -v /home/ec2-user/students.db:/app/students.db \
                    student-backend:latest
                '''
            }
        }
    }
}
