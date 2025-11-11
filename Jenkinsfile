pipeline {
    agent any  // runs on any Jenkins Windows agent

    environment {
        // Optional: your Docker Hub credentials and registry
        DOCKER_REGISTRY_CREDENTIALS = 'docker-hub-creds'
        DOCKER_REGISTRY = 'docker.io/youruser'
    }

    options {
        skipDefaultCheckout()  // manual checkout control
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                // checkout from GitHub (Jenkins automatically uses SCM configured in job)
                checkout scm
            }
        }

        stage('Build / Unit Tests') {
            steps {
                script {
                    // Windows uses 'bat' instead of 'sh'
                    bat 'where git || echo Git not found'
                    bat 'gradlew.bat -v || echo Gradle not found'
                }
            }
        }

        stage('Build Docker image') {
            when { expression { fileExists('Dockerfile') } }
            steps {
                script {
                    // Check if Docker is available
                    bat 'docker --version'
                    // Build Docker image
                    bat "docker build -t %DOCKER_REGISTRY%/myapp:%BUILD_NUMBER% ."
                }
            }
        }

        stage('Push image') {
            when { expression { env.DOCKER_REGISTRY_CREDENTIALS != null } }
            steps {
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: env.DOCKER_REGISTRY_CREDENTIALS,
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        // Log in and push image
                        bat 'echo %DOCKER_PASS% | docker login -u "%DOCKER_USER%" --password-stdin'
                        bat "docker push %DOCKER_REGISTRY%/myapp:%BUILD_NUMBER%"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "✅ Build finished: ${currentBuild.currentResult}"
        }
        failure {
            echo "❌ Build failed. Please check logs."
        }
    }
}
