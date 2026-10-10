import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
  type UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { ApiError } from './httpClient';

export const dynamoDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }),
  { marshallOptions: { removeUndefinedValues: true } },
);

function tableName() {
  const name = process.env.WEDDING_TABLE_NAME;
  if (!name)
    throw new ApiError('Wedding storage is not configured.', { status: 503 });
  return name;
}

async function conditional<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    )
      throw new ApiError(
        'Invitation not found or changed. Please reload and try again.',
        { status: 409 },
      );
    throw error;
  }
}

export const dynamoClient = {
  async get(id: string) {
    const result = await dynamoDocumentClient.send(
      new GetCommand({
        TableName: tableName(),
        Key: { id },
        ConsistentRead: true,
      }),
    );
    return result.Item;
  },
  async invitations() {
    const items: Record<string, unknown>[] = [];
    let cursor: Record<string, unknown> | undefined;
    do {
      const result = await dynamoDocumentClient.send(
        new ScanCommand({
          TableName: tableName(),
          FilterExpression: '#kind = :kind',
          ExpressionAttributeNames: { '#kind': 'kind' },
          ExpressionAttributeValues: { ':kind': 'invitation' },
          ExclusiveStartKey: cursor,
        }),
      );
      items.push(...(result.Items || []));
      cursor = result.LastEvaluatedKey;
    } while (cursor);
    return items;
  },
  async put(item: Record<string, unknown>, create = false) {
    await conditional(() =>
      dynamoDocumentClient.send(
        new PutCommand({
          TableName: tableName(),
          Item: item,
          ...(create
            ? { ConditionExpression: 'attribute_not_exists(id)' }
            : {}),
        }),
      ),
    );
    return item;
  },
  async createMany(items: Record<string, unknown>[]) {
    // One transaction keeps an import atomic; the API caps it at 100 guests.
    await dynamoDocumentClient.send(
      new TransactWriteCommand({
        TransactItems: items.map(Item => ({
          Put: {
            TableName: tableName(),
            Item,
            ConditionExpression: 'attribute_not_exists(id)',
          },
        })),
      }),
    );
  },
  async update(
    id: string,
    options: Omit<UpdateCommandInput, 'TableName' | 'Key' | 'ReturnValues'>,
  ) {
    const result = await conditional(() =>
      dynamoDocumentClient.send(
        new UpdateCommand({
          ...options,
          TableName: tableName(),
          Key: { id },
          ReturnValues: 'ALL_NEW',
        }),
      ),
    );
    return result.Attributes;
  },
  async delete(id: string) {
    await conditional(() =>
      dynamoDocumentClient.send(
        new DeleteCommand({
          TableName: tableName(),
          Key: { id },
          ConditionExpression: 'attribute_exists(id)',
        }),
      ),
    );
  },
};
