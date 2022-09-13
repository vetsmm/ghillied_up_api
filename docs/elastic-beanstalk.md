# Elastic Beanstalk Configuration

This document describes how to configure Elastic Beanstalk to run a nestjs service with a postgres database.


## Create a new application

Assuming your nestjs service has already been created in this repository, you perform the following steps.

1. Create a new application in Elastic Beanstalk.
  - Select the `Node.js` platform.
  - Select the `Node.js 16 running on 64bit Amazon Linux 2` platform branch.
  - Select the "Gettting Started" template.
  - Select the `t3.micro` instance type. (free tier eligible)
  - Select the `Single instance` environment type.
  - Select the `Create an RDS DB instance with this environment` option.
  - Select the `PostgreSQL` database engine.
  - Select the `Free tier eligible` option. (rds.t4g.micro)
  - Select the `Standard create` option.

2. Set your environment variables. (configuration -> software)
  - Set the `NODE_ENV` environment variable to `production`.
  - Set the `DATABASE_URL` environment variable to the value of the `Connection String` in the `Connect to your database` section of the `Configuration` tab of your Elastic Beanstalk application.
  - Fill int he rest

3. Setup a CodePipeline

