# Example scripts for AWS CLI Cognito usage

# Get a token
aws cognito-idp initiate-auth --client-id <replace> --auth-flow USER_PASSWORD_AUTH --auth-parameters Username=<replace>,Password=<replace>

# Mark user password as permanent
aws cognito-idp admin-set-user-password --user-pool-id <replace> --username <replace> --password <replace> --permanent