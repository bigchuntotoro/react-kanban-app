pipeline {
    agent any

    environment {
        // ==============================================
        // Application
        // ==============================================
        TARGET_DIR   = '/home/totoro/Reactproject/react-kanban-app'
        APP_NAME     = 'react-kanban-app'
        SERVICE_NAME = 'react-kanban-app'

        // ==============================================
        // Frontend
        // ==============================================
        FRONTEND_DIR = "${WORKSPACE}/src/frontend"
        NGINX_ROOT   = '/usr/share/nginx/html/react-kanban-app'

        // ==============================================
        // Runtime
        // ==============================================
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64'

        // Spring Boot 실제 포트와 반드시 일치시킬 것
        APP_PORT = '8083'

        PATH = "/usr/local/bin:/usr/bin:/bin:${env.PATH}"
    }

    stages {

        // ==================================================
        // 1. Build Frontend
        // ==================================================
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


        // ==================================================
        // 2. Build Backend
        // ==================================================
        stage('2. Build Backend (Spring Boot)') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "2. Build Backend (Spring Boot)"
                    echo "=============================================="

                    echo "==> Java Version"
                    ${JAVA_HOME}/bin/java -version

                    echo "==> Granting Execution Permission"
                    chmod +x ./gradlew

                    echo "==> Building Spring Boot JAR"

                    ./gradlew clean bootJar -x test

                    echo "==> Build Result"
                    ls -lh build/libs/

                    echo "==> Backend Build Completed"
                '''
            }
        }


        // ==================================================
        // 3. Deploy Frontend
        // ==================================================
        stage('3. Deploy Frontend to Nginx') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "3. Deploy Frontend to Nginx"
                    echo "=============================================="

                    echo "==> Creating Nginx Directory"

                    sudo mkdir -p "${NGINX_ROOT}"


                    # ------------------------------------------
                    # Vite
                    # ------------------------------------------
                    if [ -d "${FRONTEND_DIR}/dist" ]; then

                        echo "==> Vite dist directory detected"

                        sudo rsync -av --delete \
                            "${FRONTEND_DIR}/dist/" \
                            "${NGINX_ROOT}/"


                    # ------------------------------------------
                    # Create React App
                    # ------------------------------------------
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


        // ==================================================
        // 4. Deploy Backend JAR
        // ==================================================
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


                    echo "==> Deployed JAR"

                    ls -lh \
                        "${TARGET_DIR}/${APP_NAME}.jar"


                    echo "==> Backend JAR Deployment Completed"
                '''
            }
        }


        // ==================================================
        // 5. Restart Backend
        // ==================================================
        stage('5. Restart Backend with systemd') {
            steps {
                sh '''
                    set -e

                    echo "=============================================="
                    echo "5. Restart Backend with systemd"
                    echo "=============================================="

                    echo "==> Service Name"
                    echo "${SERVICE_NAME}"

                    echo "==> Backend Port"
                    echo "${APP_PORT}"


                    // ------------------------------------------
                    // systemd reload
                    // ------------------------------------------
                    echo "==> Reloading systemd"

                    sudo -n systemctl daemon-reload


                    // ------------------------------------------
                    // restart
                    // ------------------------------------------
                    echo "==> Restarting ${SERVICE_NAME}"

                    sudo -n systemctl restart "${SERVICE_NAME}"


                    // ------------------------------------------
                    // wait
                    // ------------------------------------------
                    echo "==> Waiting for Application Startup"

                    sleep 5


                    // ------------------------------------------
                    // systemd status
                    // ------------------------------------------
                    echo "==> Checking systemd Service"

                    if sudo -n systemctl is-active --quiet "${SERVICE_NAME}"; then

                        echo "=============================================="
                        echo "Backend systemd Service is ACTIVE"
                        echo "=============================================="

                    else

                        echo "=============================================="
                        echo "ERROR: Backend Service is NOT ACTIVE"
                        echo "=============================================="

                        echo "==> systemctl status"

                        sudo -n systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true


                        echo "==> journalctl"

                        sudo -n journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true


                        exit 1

                    fi


                    // ------------------------------------------
                    // Backend HTTP Health Check
                    // ------------------------------------------
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


                        echo "Attempt ${i}/30"
                        echo "HTTP Status: ${HTTP_STATUS}"


                        if [ "$HTTP_STATUS" != "000" ]; then

                            echo "=============================================="
                            echo "Backend is responding"
                            echo "=============================================="

                            BACKEND_OK=true

                            break

                        fi


                        echo "Waiting for backend..."

                        sleep 1

                    done


                    // ------------------------------------------
                    // Backend failed
                    // ------------------------------------------
                    if [ "$BACKEND_OK" != "true" ]; then

                        echo "=============================================="
                        echo "ERROR: Backend did not respond"
                        echo "=============================================="


                        echo "==> Listening Ports"

                        ss -lntp | grep "${APP_PORT}" || true


                        echo "==> systemctl status"

                        sudo -n systemctl \
                            --no-pager \
                            -l \
                            status "${SERVICE_NAME}" || true


                        echo "==> journalctl"

                        sudo -n journalctl \
                            -u "${SERVICE_NAME}" \
                            -n 100 \
                            --no-pager || true


                        exit 1

                    fi


                    // ------------------------------------------
                    // Deployment success
                    // ------------------------------------------
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


    // ==================================================
    // Post
    // ==================================================
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
