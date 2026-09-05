pipeline {
    agent any

    environment {
        // ============================================================
        // Project
        // ============================================================
        TARGET_DIR   = '/home/totoro/Reactproject/react-kanban-app'
        APP_NAME     = 'react-kanban-app'
        SERVICE_NAME = 'react-kanban-app'

        // ============================================================
        // Frontend
        // ============================================================
        FRONTEND_DIR = "${WORKSPACE}/src/frontend"
        NGINX_ROOT   = '/usr/share/nginx/html/react-kanban-app'

        // ============================================================
        // Backend
        // ============================================================
        JAVA_HOME    = '/usr/lib/jvm/java-21-openjdk-amd64'
        APP_PORT     = '8082'

        // ============================================================
        // PATH
        // ============================================================
        PATH = "/usr/local/bin:/usr/bin:/bin"
    }

    stages {

        // ============================================================
        // 1. React Frontend Build
        // ============================================================
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

                        echo "==> Installing dependencies"
                        npm install

                        echo "==> Building React application"
                        npm run build

                        echo "==> Frontend Build Result"

                        if [ -d "dist" ]; then
                            echo "Build directory : dist"
                            ls -lah dist

                        elif [ -d "build" ]; then
                            echo "Build directory : build"
                            ls -lah build

                        else
                            echo "ERROR: Frontend build directory not found."
                            exit 1
                        fi

                        echo "==> Frontend Build Completed"
                    '''
                }
            }
        }


        // ============================================================
        // 2. Spring Boot Backend Build
        // ============================================================
        stage('2. Build Backend (Spring Boot)') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "2. Build Backend (Spring Boot)"
                    echo "=============================================="

                    echo "==> Java Version"
                    ${JAVA_HOME}/bin/java -version

                    echo "==> Gradle Wrapper Permission"
                    ls -l ./gradlew

                    echo "==> Granting Gradle execute permission"
                    chmod +x ./gradlew

                    echo "==> Gradle Wrapper Permission After chmod"
                    ls -l ./gradlew

                    echo "==> Gradle Version"
                    ./gradlew --version

                    echo "==> Building Spring Boot JAR"
                    ./gradlew clean bootJar -x test

                    echo "==> Build Result"
                    ls -lh build/libs/

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

                    echo "BUILD_JAR = $BUILD_JAR"

                    echo "==> Backend Build Completed"
                '''
            }
        }


        // ============================================================
        // 3. Deploy React Frontend to Nginx
        // ============================================================
        stage('3. Deploy Frontend to Nginx') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "3. Deploy Frontend to Nginx"
                    echo "=============================================="

                    echo "Nginx Root: ${NGINX_ROOT}"

                    echo "==> Creating Nginx Directory"

                    sudo -n mkdir -p "${NGINX_ROOT}"

                    if [ -d "${FRONTEND_DIR}/dist" ]; then

                        echo "==> Vite/React dist directory detected"

                        sudo -n rsync -av --delete \
                            "${FRONTEND_DIR}/dist/" \
                            "${NGINX_ROOT}/"

                    elif [ -d "${FRONTEND_DIR}/build" ]; then

                        echo "==> CRA build directory detected"

                        sudo -n rsync -av --delete \
                            "${FRONTEND_DIR}/build/" \
                            "${NGINX_ROOT}/"

                    else

                        echo "ERROR: Frontend build directory not found."
                        exit 1

                    fi

                    echo "==> Setting Nginx ownership"

                    sudo -n chown -R \
                        www-data:www-data \
                        "${NGINX_ROOT}"

                    echo "==> Testing Nginx configuration"

                    sudo -n nginx -t

                    echo "==> Reloading Nginx"

                    sudo -n systemctl reload nginx

                    echo "==> Frontend Deployment Completed"
                '''
            }
        }


        // ============================================================
        // 4. Deploy Spring Boot JAR
        // ============================================================
        stage('4. Deploy Backend JAR') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "4. Deploy Backend JAR"
                    echo "=============================================="

                    echo "Target Directory: ${TARGET_DIR}"

                    echo "==> Creating application directory"

                    sudo -n mkdir -p "${TARGET_DIR}"

                    echo "==> Creating log directory"

                    sudo -n mkdir -p "${TARGET_DIR}/logs"

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

                    echo "BUILD_JAR = $BUILD_JAR"

                    echo "==> Copying JAR"

                    sudo -n cp -f \
                        "$BUILD_JAR" \
                        "${TARGET_DIR}/${APP_NAME}.jar"

                    echo "==> Setting JAR ownership"

                    sudo -n chown \
                        totoro:totoro \
                        "${TARGET_DIR}/${APP_NAME}.jar"

                    echo "==> Setting log directory ownership"

                    sudo -n chown -R \
                        totoro:totoro \
                        "${TARGET_DIR}/logs"

                    echo "==> Deployed JAR"

                    ls -lh "${TARGET_DIR}/${APP_NAME}.jar"

                    echo "==> Backend JAR Deployment Completed"
                '''
            }
        }


        // ============================================================
        // 5. Restart Spring Boot systemd Service
        // ============================================================
        stage('5. Restart Backend with systemd') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "5. Restart Backend with systemd"
                    echo "=============================================="

                    echo "Service     : ${SERVICE_NAME}"
                    echo "Backend Port: ${APP_PORT}"

                    echo "==> systemd daemon-reload"

                    sudo -n systemctl daemon-reload

                    echo "==> Restarting Backend Service"

                    sudo -n systemctl restart "${SERVICE_NAME}"

                    echo "==> Waiting for Spring Boot startup"

                    sleep 5

                    echo "==> Checking systemd service status"

                    if ! sudo -n systemctl is-active --quiet "${SERVICE_NAME}"; then

                        echo "ERROR: ${SERVICE_NAME} failed to start."

                        echo "=============================================="
                        echo "systemctl status"
                        echo "=============================================="

                        sudo -n systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true

                        echo "=============================================="
                        echo "journalctl"
                        echo "=============================================="

                        sudo -n journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true

                        echo "=============================================="
                        echo "Listening Port"
                        echo "=============================================="

                        ss -lntp | grep ":${APP_PORT}" || true

                        exit 1
                    fi

                    echo "==> Backend Service is ACTIVE"

                    echo "=============================================="
                    echo "Checking Backend HTTP Response"
                    echo "=============================================="

                    BACKEND_OK=false
                    HTTP_STATUS="000"

                    for i in $(seq 1 30); do

                        HTTP_STATUS=$(curl \
                            -s \
                            -o /dev/null \
                            -w "%{http_code}" \
                            --connect-timeout 1 \
                            --max-time 3 \
                            "http://127.0.0.1:${APP_PORT}/api/tasks" \
                            || true)

                        if [ "$HTTP_STATUS" != "000" ]; then

                            echo "Backend is responding."
                            echo "Port        : ${APP_PORT}"
                            echo "HTTP Status : ${HTTP_STATUS}"
                            echo "Attempt     : ${i}/30"

                            BACKEND_OK=true

                            break
                        fi

                        echo "Waiting for backend..."
                        echo "Attempt: ${i}/30"

                        sleep 1
                    done


                    if [ "$BACKEND_OK" != "true" ]; then

                        echo "ERROR: Backend did not respond on port ${APP_PORT}"

                        echo "=============================================="
                        echo "systemctl status"
                        echo "=============================================="

                        sudo -n systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true

                        echo "=============================================="
                        echo "journalctl"
                        echo "=============================================="

                        sudo -n journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true

                        echo "=============================================="
                        echo "Listening Port"
                        echo "=============================================="

                        ss -lntp | grep ":${APP_PORT}" || true

                        exit 1
                    fi


                    echo "=============================================="
                    echo "Backend Deployment Completed"
                    echo "=============================================="

                    echo "Service     : ${SERVICE_NAME}"
                    echo "Backend Port: ${APP_PORT}"
                    echo "HTTP Status : ${HTTP_STATUS}"

                    echo "=============================================="
                '''
            }
        }
    }


    // ================================================================
    // Pipeline Result
    // ================================================================
    post {

        success {
            echo """
            ==============================================
            Deployment SUCCESS
            ==============================================

            Application : ${APP_NAME}
            Service     : ${SERVICE_NAME}
            Backend Port: ${APP_PORT}

            Frontend    : Nginx
            Backend     : Spring Boot
            Status      : ACTIVE

            ==============================================
            """
        }

        failure {
            echo """
            ==============================================
            Deployment FAILED
            ==============================================

            Application : ${APP_NAME}
            Service     : ${SERVICE_NAME}
            Backend Port: ${APP_PORT}

            Check Jenkins Console and systemd logs.

            ==============================================
            """
        }

        always {
            echo "Jenkins Pipeline Finished"
        }
    }
}
