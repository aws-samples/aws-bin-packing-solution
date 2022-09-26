# Sandbox build/deploy Notes

Though CDK provided by this project includes a full CI/CD pipeline, it is often useful to have a personal sandbox development environment so that infrastructure code changes can be tested without making commits to Git repository monitored by the CI/CD pipeline.

- if needed, install the AWS CDK tools via 
```bash
npm i -g aws-cdk
```
- all work on the infrastructure code is done within
```bash
${PROJECT_ROOT}/application/typescript/packages/@aws-prototype/cicd/
```

- if using a new account, make sure the region is set via 

```bash
aws configure --profile ${PROFILENAME}
```

- ensure that you have run `cdk boostrap`. The following sample shows the full command and profile useage:
```bash
cdk bootstrap --profile ${PROFILE_NAME} --trust ${ACCOUNT_NUM} --cloudformation-execution-policies arn:aws:iam::aws:policy/PowerUserAccess --cloudformation-execution-policies arn:aws:iam::aws:policy/IAMFullAccess aws://${ACCOUNTNUM}/ap-southeast-2
```

- the build, synth and deploy-sandbox scripts in `${PROJECT_ROOT}/application/typescript/packages/@aws-prototype/cicd/package.json` check for AWS_PROFILE being set