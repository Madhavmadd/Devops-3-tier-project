pipeline{
    agent any

    environment {

        // EC2-2 private IP
        BACKEND_SERVER = "10.0.139.2"

        // Docker image name
        DOCKER_IMAGE = "student-backend"

        // Docker container name
        CONTAINER_NAME = "student-backend"

        // Backend port
        BACKEND_PORT = "5000"

        // Frontend directory on EC2-1
        FRONTEND_DIR = "/var/www/student-frontend"

    }

    stages{
        stage("git checkout scm") {
            steps{
                git branch: 'main', credentialsId: 'Github', url: 'https://github.com/Madhavmadd/Devops-3-tier-project.git'
            }

        }

        stage("Frontend Validation"){
            steps{
                echo "Validating frontend files..."

                sh '''
                    test -f frontend/index.html
                    test -f frontend/app.js
                    test -f frontend/style.css

                    echo "Frontend files are present"
                '''
            }
        }

        stage("Backend npm install"){
            steps{
                echo "Installing backend dependencies..."

                sh '''
                    cd backend

                    npm install
                '''
            }
        }

        stage("backend test"){
            steps{
                echo "Testing backend JavaScript..."

                sh '''
                    cd backend

                    node --check server.js

                    echo "Backend syntax validation successful"
                '''
            }
        }
        
    }

}


