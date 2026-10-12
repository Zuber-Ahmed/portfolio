// Server-side configuration only. Read at call time to preserve runtime settings.
export function getServerConfig() {
  return {
    awsRegion: process.env.AWS_REGION || 'ap-south-1',
    weddingTableName: process.env.WEDDING_TABLE_NAME,
    appOrigin: process.env.APP_ORIGIN?.replace(/\/$/, ''),
    cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    cognitoAdminGroup:
      process.env.COGNITO_ADMIN_GROUP || 'wedding-admin-production',
    weddingEventMode: process.env.WEDDING_EVENT_MODE === 'true',
  };
}
