pipeline {
  agent any

  environment {
    DOCKERHUB = "yourdockerhubusername"
    IMAGE_BACKEND = "${DOCKERHUB}/devops-backend"
    IMAGE_FRONTEND = "${DOCKERHUB}/devops-frontend"
    DOCKERHUB_CREDS = "dockerhub-creds"        // Jenkins credentials id
    SSH_CREDENTIALS = "ssh-deploy-key"         // Jenkins SSH key id (optional)
    DEPLOY_HOST = "user@your.server.com"       // server for SSH deploy (optional)
    KUBE_CONFIG = "kubeconfig"                 // credentials id for kubeconfig (optional)
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'master', url: 'https://github.com/SmitaPraharaj/git-devops-project.git'
      }
    }

    stage('Install & Test Backend') {
      steps {
        dir('backend') {
          sh 'npm ci'
          sh 'npm test || echo "Backend tests failed"'
        }
      }
    }

    stage('Install & Test Frontend') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm test || echo "Frontend tests failed"'
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        // build images and tag with commit id
        script {
          def shortSha = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          sh "docker build -t ${IMAGE_BACKEND}:${shortSha} ./backend"
          sh "docker build -t ${IMAGE_FRONTEND}:${shortSha} ./frontend"

          // also tag latest (optional)
          sh "docker tag ${IMAGE_BACKEND}:${shortSha} ${IMAGE_BACKEND}:latest"
          sh "docker tag ${IMAGE_FRONTEND}:${shortSha} ${IMAGE_FRONTEND}:latest"

          // stash the sha for later
          writeFile file: 'image-sha.txt', text: shortSha
          archiveArtifacts artifacts: 'image-sha.txt', fingerprint: true
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDS}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          script {
            sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
            def sha = readFile('image-sha.txt').trim()
            sh "docker push ${IMAGE_BACKEND}:${sha}"
            sh "docker push ${IMAGE_BACKEND}:latest"
            sh "docker push ${IMAGE_FRONTEND}:${sha}"
            sh "docker push ${IMAGE_FRONTEND}:latest"
            sh 'docker logout'
          }
        }
      }
    }

    stage('Deploy - SSH to VM (docker-compose)') {
      when { expression { return env.DEPLOY_HOST != null && env.SSH_CREDENTIALS != "" } }
      steps {
        sshagent (credentials: [SSH_CREDENTIALS]) {
          // copy docker-compose (optional) or run remote commands to pull images & restart
          script {
            def sha = readFile('image-sha.txt').trim()
            sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_HOST} 'docker pull ${IMAGE_BACKEND}:${sha} && docker pull ${IMAGE_FRONTEND}:${sha} && cd /path/to/compose && docker-compose pull && docker-compose up -d --remove-orphans'"
          }
        }
      }
    }

    stage('Deploy - Kubernetes (kubectl)') {
      when { expression { return env.KUBE_CONFIG != null && env.KUBE_CONFIG != "" } }
      steps {
        withCredentials([file(credentialsId: "${KUBE_CONFIG}", variable: 'KUBECONF')]) {
          script {
            def sha = readFile('image-sha.txt').trim()
            // set KUBECONFIG to use kubectl
            sh 'export KUBECONFIG=${KUBECONF}'
            // update images on deployments (example names: backend-deploy, frontend-deploy)
            sh "kubectl set image deployment/backend-deploy backend=${IMAGE_BACKEND}:${sha} --record || true"
            sh "kubectl set image deployment/frontend-deploy frontend=${IMAGE_FRONTEND}:${sha} --record || true"
          }
        }
      }
    }
  } // stages

  post {
    success { echo "Pipeline finished successfully" }
    failure { echo "Pipeline failed" }
  }
}
