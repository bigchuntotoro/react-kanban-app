pipeline {
    agent any

    environment {
        // 배포 경로
        TARGET_DIR   = '/home/totoro/Reactproject/react-kanban-app'
        APP_NAME     = 'react-kanban-app'
        SERVICE_NAME = 'react-kanban-app'

        // Frontend
        FRONTEND_DIR = "${WORKSPACE}/src/frontend"
        NGINX_ROOT   = '/usr/share/nginx/html/react-kanban-app'

        // 실행 환경
        JAVA_HOME    = '/usr/lib/jvm/java-21-openjdk-amd64'
        APP_PORT     = '8082'
        PATH         = "/usr/local/bin:/usr/bin:/bin:${env.PATH}"
    }

    stages {

        stage('1. Build Frontend (React)') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        set -e

                        echo "=============================================="
                        echo "1. Build Frontend (React)"
                        echo "=============================================="

                        echo "==> Node Version"
                        node --version

                        echo "==> NPM Version"
                        npm --version

                        echo "==> Installing Dependencies"
                        npm install

                        echo "==> Building Frontend Application"
                        npm run build

                        echo "==> Frontend Build Completed"
                    '''
                }
            }
        }


        stage('2. Build Backend (Spring Boot)') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "2. Build Backend (Spring Boot)"
                    echo "=============================================="

                    echo "==> Java Version"
                    ${JAVA_HOME}/bin/java -version

                    echo "==> Granting Execution Permission to Gradle Wrapper"
                    chmod +x ./gradlew

                    echo "==> Building Spring Boot JAR"

                    ./gradlew clean bootJar -x test

                    echo "==> Build Result"
                    ls -lh build/libs/

                    echo "==> Backend Build Completed"
                '''
            }
        }


        stage('3. Deploy Frontend to Nginx') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "3. Deploy Frontend to Nginx"
                    echo "=============================================="

                    echo "==> Creating Nginx Directory"

                    sudo mkdir -p "${NGINX_ROOT}"


                    # Vite
                    if [ -d "${FRONTEND_DIR}/dist" ]; then

                        echo "==> Vite dist directory detected"

                        sudo rsync -av --delete \
                            "${FRONTEND_DIR}/dist/" \
                            "${NGINX_ROOT}/"


                    # Create React App
                    elif [ -d "${FRONTEND_DIR}/build" ]; then

                        echo "==> React build directory detected"

                        sudo rsync -av --delete \
                            "${FRONTEND_DIR}/build/" \
                            "${NGINX_ROOT}/"


                    else

                        echo "ERROR: Frontend build directory not found."

                        exit 1

                    fi


                    echo "==> Setting Nginx Ownership"

                    sudo chown -R www-data:www-data \
                        "${NGINX_ROOT}"


                    echo "==> Testing Nginx Configuration"

                    sudo nginx -t


                    echo "==> Reloading Nginx"

                    sudo systemctl reload nginx


                    echo "==> Nginx Reload Completed"
                '''
            }
        }


        stage('4. Deploy Backend JAR') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "4. Deploy Backend JAR"
                    echo "=============================================="

                    echo "==> Preparing Target Directory"

                    sudo mkdir -p "${TARGET_DIR}"
                    sudo mkdir -p "${TARGET_DIR}/logs"


                    echo "==> Searching Spring Boot JAR"

                    BUILD_JAR=$(find build/libs \
                        -maxdepth 1 \
                        -type f \
                        -name "*.jar" \
                        ! -name "*-plain.jar" \
                        | head -n 1)


                    if [ -z "$BUILD_JAR" ]; then

                        echo "ERROR: Spring Boot JAR file not found."

                        exit 1

                    fi


                    echo "==> Found JAR:"
                    echo "$BUILD_JAR"


                    echo "==> Copying JAR"

                    sudo cp -f \
                        "$BUILD_JAR" \
                        "${TARGET_DIR}/${APP_NAME}.jar"


                    echo "==> Setting Application Ownership"

                    sudo chown totoro:totoro \
                        "${TARGET_DIR}/${APP_NAME}.jar"


                    sudo chown -R totoro:totoro \
                        "${TARGET_DIR}/logs"


                    echo "==> Deployed JAR:"

                    ls -lh \
                        "${TARGET_DIR}/${APP_NAME}.jar"


                    echo "==> Backend JAR Deployment Completed"
                '''
            }
        }


        stage('5. Restart Backend with systemd') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "5. Restart Backend with systemd"
                    echo "=============================================="


                    echo "==> Reloading systemd"

                    sudo systemctl daemon-reload


                    echo "==> Restarting ${SERVICE_NAME}"

                    sudo systemctl restart "${SERVICE_NAME}"


                    echo "==> Waiting for Application Startup"

                    sleep 3


                    echo "==> Checking systemd Service"

                    if ! sudo systemctl is-active --quiet "${SERVICE_NAME}"; then

                        echo "ERROR: ${SERVICE_NAME} failed to start."

                        echo "=============================================="
                        echo "systemctl status"
                        echo "=============================================="

                        sudo systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true


                        echo "=============================================="
                        echo "journalctl"
                        echo "=============================================="

                        sudo journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true


                        exit 1

                    fi


                    echo "==> Backend Service is ACTIVE"


                    echo "=============================================="
                    echo "Checking Backend Port ${APP_PORT}"
                    echo "=============================================="


                    BACKEND_OK=false


                    for i in $(seq 1 30); do

                        HTTP_STATUS=$(curl -s \
                            -o /dev/null \
                            -w "%{http_code}" \
                            --connect-timeout 1 \
                            --max-time 3 \
                            "http://127.0.0.1:${APP_PORT}/" \
                            || true)


                        if [ "$HTTP_STATUS" != "000" ]; then

                            echo "Backend is responding."

                            echo "Port       : ${APP_PORT}"
                            echo "HTTP Status: ${HTTP_STATUS}"
                            echo "Attempt    : ${i}/30"

                            BACKEND_OK=true

                            break

                        fi


                        echo "Waiting for backend... ${i}/30"

                        sleep 1

                    done


                    if [ "$BACKEND_OK" != "true" ]; then

                        echo "=============================================="
                        echo "ERROR: Backend did not respond"
                        echo "=============================================="


                        echo "==> systemctl status"

                        sudo systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true


                        echo "==> journalctl"

                        sudo journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true


                        exit 1

                    fi


                    echo "=============================================="
                    echo "Backend Deployment Completed"
                    echo "=============================================="


                    echo "Service : ${SERVICE_NAME}"
                    echo "Port    : ${APP_PORT}"
                    echo "JAR     : ${TARGET_DIR}/${APP_NAME}.jar"

                '''
            }
        }
    }


    post {

        success {

            echo """
==============================================
Deployment SUCCESS
==============================================

Application : ${env.APP_NAME}
Service     : ${env.SERVICE_NAME}
Backend Port: ${env.APP_PORT}
Frontend    : ${env.NGINX_ROOT}

Spring Boot : systemd
Nginx       : systemd

==============================================
"""
        }


        failure {

            echo """
==============================================
Deployment FAILED
==============================================

Application : ${env.APP_NAME}
Service     : ${env.SERVICE_NAME}
Backend Port: ${env.APP_PORT}

Check Jenkins Console and systemd logs.

==============================================
"""
        }


        always {

            echo "Jenkins Pipeline Finished"

        }
    }
}