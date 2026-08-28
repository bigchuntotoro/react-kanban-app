pipeline {
    agent any

    environment {
        // 배포 경로 설정
        TARGET_DIR   = '/home/totoro/Reactproject/react-kanban-app'
        APP_NAME     = 'react-kanban-app'
        FRONTEND_DIR = "${WORKSPACE}/src/main/frontend"
        NGINX_ROOT   = '/usr/share/nginx/html/react-kanban-app'

        // 실행 환경 설정
        JAVA_HOME    = '/usr/lib/jvm/java-17-openjdk-amd64' // 필요시 서버의 Java 경로로 수정
        APP_PORT     = '8082'
    }

    stages {
        stage('1. Build Frontend (React)') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        echo "==> Node/NPM Dependencies Installation"
                        npm install

                        echo "==> Building Frontend Application"
                        npm run build
                    '''
                }
            }
        }

        stage('2. Build Backend (Spring Boot)') {
            steps {
                sh '''
                    echo "==> Granting Execution Permission to Gradle Wrapper"
                    chmod +x ./gradlew

                    echo "==> Building Spring Boot JAR (Skipping Frontend Task inside Gradle)"
                    ./gradlew clean bootJar -x test
                '''
            }
        }

        stage('3. Deploy Frontend to Nginx') {
            steps {
                sh '''
                    echo "==> Syncing Frontend Assets to Nginx Directory"
                    sudo mkdir -p ${NGINX_ROOT}

                    # Vite 빌드 결과물(dist) 또는 CRA 결과물(build)을 Nginx 웹 루트로 복사
                    # Vite 사용 기준: dist / CRA 사용 시 build로 수정
                    if [ -d "${FRONTEND_DIR}/dist" ]; then
                        sudo rsync -av --delete ${FRONTEND_DIR}/dist/ ${NGINX_ROOT}/
                    elif [ -d "${FRONTEND_DIR}/build" ]; then
                        sudo rsync -av --delete ${FRONTEND_DIR}/build/ ${NGINX_ROOT}/
                    fi

                    sudo chown -R www-data:www-data ${NGINX_ROOT}
                '''
            }
        }

        stage('4. Deploy Backend & Restart Application') {
            steps {
                sh '''
                    echo "==> Preparing Target Directory"
                    mkdir -p ${TARGET_DIR}

                    echo "==> Copying Spring Boot Executable JAR"
                    cp build/libs/*.jar ${TARGET_DIR}/${APP_NAME}.jar

                    cd ${TARGET_DIR}

                    echo "==> Restarting Backend Service via PM2"
                    pm2 describe ${APP_NAME} > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo "Existing PM2 process found. Reloading..."
                        pm2 restart ${APP_NAME}
                    else
                        echo "Starting new PM2 process..."
                        pm2 start "java -jar -Dserver.port=${APP_PORT} ${APP_NAME}.jar" --name "${APP_NAME}"
                    fi

                    pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "Successfully deployed ${APP_NAME}!"
        }
        failure {
            echo "Deployment failed. Check Jenkins console logs."
        }
    }
}