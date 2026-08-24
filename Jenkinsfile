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

        stage("docker build"){
            steps{
                echo "Building backend Docker image..."

                sh '''
                    cd backend

                    docker build \
                    -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .

                    docker tag \
                    ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                    ${DOCKER_IMAGE}:latest
                '''
            }
        }

        stage('Deploy Backend to EC2-2') {
            steps {
                stage('Deploy Backend to EC2-2') {
    steps {
        echo 'Deploying backend to EC2-2...'
        sh '''
            docker save student-backend:10 | gzip | ssh -o StrictHostKeyChecking=no ubuntu@10.0.139.2 gunzip | docker load
            ssh -i /var/lib/jenkins/.ssh/id_ed25519 -o StrictHostKeyChecking=no ubuntu@10.0.139.2 '
                set -e
                echo "Stopping old container..."
                docker stop student-backend || true
                echo "Removing old container..."
                docker rm student-backend || true
                echo "Starting new container..."
                docker run -d --name student-backend --restart unless-stopped -p 5000:5000 student-backend:10
                echo "Backend deployment completed"
            '
        '''
    }
}
            }
        }
        
    }

}
