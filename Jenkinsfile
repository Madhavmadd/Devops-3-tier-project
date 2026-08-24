pipeline {
    agent any
    environment {
        BACKEND_SERVER = "10.0.139.2"
        DOCKER_IMAGE   = "student-backend"
        CONTAINER_NAME = "student-backend"
        BACKEND_PORT   = "5000"
        FRONTEND_DIR   = "/var/www/html"
    }
    stages {
        stage("git checkout scm") {
            steps { git branch: 'main', credentialsId: 'Github', url: 'https://github.com/Madhavmadd/Devops-3-tier-project.git' }
        }
        stage("Frontend Validation") {
            steps { sh '''
                test -f frontend/index.html
                test -f frontend/app.js
                test -f frontend/style.css
                echo "Frontend files are present"
            ''' }
        }
        stage("Backend npm install") {
            steps { sh 'cd backend && npm install' }
        }
        stage("backend test") {
            steps { sh 'cd backend && node --check server.js && echo "Backend syntax validation successful"' }
        }
        stage("docker build") {
            steps { sh '''
                cd backend
                docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
            ''' }
        }
        stage('Deploy Backend to EC2-2') {
            steps {
                echo 'Deploying backend to EC2-2...'
                sh """
                    docker save ${DOCKER_IMAGE}:${BUILD_NUMBER} | gzip | ssh -i /var/lib/jenkins/.ssh/id_ed25519 -o StrictHostKeyChecking=no ubuntu@${BACKEND_SERVER} "
                        gunzip | docker load
                        echo 'Stopping old container...'
                        docker stop ${CONTAINER_NAME} || true
                        echo 'Removing old container...'
                        docker rm ${CONTAINER_NAME} || true
                        echo 'Starting new container...'
                        docker run -d --name ${CONTAINER_NAME} --restart unless-stopped -p ${BACKEND_PORT}:${BACKEND_PORT} ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        echo 'Backend deployment completed'
                    "
                """
            }
        }

        stage("Deploy fronend to EC2-1"){
            steps {

                echo "Deploying frontend..."

                sh '''
                    sudo mkdir -p ${FRONTEND_DIR}

                    sudo cp frontend/index.html \
                    ${FRONTEND_DIR}/

                    sudo cp frontend/app.js \
                    ${FRONTEND_DIR}/

                    sudo cp frontend/style.css \
                    ${FRONTEND_DIR}/

                    echo "Frontend deployment completed"
                '''
            }
        }

        stage('Nginx Reload') {

            steps {

                echo "Testing and reloading Nginx..."

                sh '''
                    sudo nginx -t

                    sudo systemctl reload nginx

                    echo "Nginx reloaded successfully"
                '''
            }
        }

        stage('Health Check') {

            steps {

                echo "Checking backend health..."

                sh '''
                    sleep 5

                    curl -f \
                    http://${BACKEND_SERVER}:${BACKEND_PORT}/api/health

                    echo ""

                    echo "Backend health check successful"
                '''
            }
        }
    }
}




