// Jenkins Pipeline Configuration
// This file provides Jenkins pipeline configuration for CI/CD

pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.54.1-focal'
            args '-u root:root'
        }
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
    }

    environment {
        NODE_ENV = 'test'
        HEADLESS = 'true'
        CI = 'true'
    }

    stages {
        stage('Setup') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Lint') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                echo 'Running TypeScript checks...'
                sh 'npx tsc --noEmit'
            }
        }

        stage('Smoke Tests') {
            when {
                changeRequest()
            }
            steps {
                echo 'Running smoke tests...'
                sh 'npm run test:smoke'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Smoke Test Report'
                    ])
                    junit 'reports/**/junit-results.xml'
                }
            }
        }

        stage('Parallel Tests') {
            when {
                branch 'main'
            }
            parallel {
                stage('WebApp Tests') {
                    steps {
                        echo 'Running WebApp tests...'
                        sh 'npm run test:webapp:ui'
                        sh 'npm run test:webapp:api'
                    }
                }
                stage('AdminApp Tests') {
                    steps {
                        echo 'Running AdminApp tests...'
                        sh 'npm run test:adminapp:ui'
                        sh 'npm run test:adminapp:api'
                    }
                }
                stage('MCP Server Tests') {
                    steps {
                        echo 'Running MCP Server tests...'
                        sh 'npm run test:mcp:api'
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Full Test Report'
                    ])
                    junit 'reports/**/junit-results.xml'
                }
            }
        }

        stage('Cross-Browser Tests') {
            when {
                branch 'main'
            }
            matrix {
                axes {
                    axis {
                        name 'BROWSER'
                        values 'chromium', 'firefox', 'webkit'
                    }
                }
                stages {
                    stage('Browser Test') {
                        steps {
                            echo "Running tests on ${BROWSER}..."
                            sh "BROWSER=${BROWSER} npm run test:smoke"
                        }
                    }
                }
            }
        }

        stage('BDD Tests') {
            when {
                anyOf {
                    branch 'main'
                    changeRequest()
                }
            }
            steps {
                echo 'Running BDD tests...'
                sh 'npm run bdd:generate'
                sh 'npm run test:bdd:all'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports',
                        reportFiles: '**/cucumber-report.html',
                        reportName: 'BDD Test Report'
                    ])
                }
            }
        }
    }

    post {
        always {
            echo 'Archiving test artifacts...'
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
        failure {
            echo 'Pipeline failed! Sending notifications...'
            // Add notification logic here (email, Slack, etc.)
        }
        success {
            echo 'Pipeline succeeded!'
        }
    }
}

