# Webhooks API

> Generated from: https://caliper.alpha-1edtech.com/webhooks/openapi.yaml
> Generated on: 2025-09-18T03:08:05.665Z

---

# Webhooks API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

# Webhooks API

## Overview

The Alpha Webhooks API allows you to register endpoints that will receive real-time notifications when Caliper events are processed by our system. This enables your application to react immediately to learning events without the need for polling or direct database access.

# Authentication

## Guide

Most endpoints require authentication using the `Authorization: Bearer <token>` header.

The token can be obtained with:

```curl
curl -X POST https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com/oauth2/token \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials&client_id=<your-client-id>&client_secret=<your-client-secret>"
```

Use the correct IDP server depending on the environment you're using:

- Production Server: <https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com>
- Staging Server: <https://alpha-auth-development-idp.auth.us-west-2.amazoncognito.com>

Reach out to the platform team to get a client/secret pair for your application.

## Servers

- **URL:** `https://caliper.alpha-1edtech.com`
  - **Description:** Webhooks API

## Operations

### Get all webhook filters

- **Method:** `GET`
- **Path:** `/webhook-filters/`
- **Tags:** Webhook Filters

Returns all webhook filters

#### Responses

##### Status: 200 Webhook filters retrieved successfully

###### Content-Type: application/json

- **`filters` (required)**

  `array`

  **Items:**

  - **`active` (required)**

    `boolean` — Whether the filter is active

  - **`createdAt` (required)**

    `string` — The date and time the filter was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the filter was deleted

  - **`filterKey` (required)**

    `string` — The key to filter on

  - **`filterOperation` (required)**

    `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

  - **`filterType` (required)**

    `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

  - **`filterValue` (required)**

    `string` — The value to filter on

  - **`updatedAt` (required)**

    `string` — The date and time the filter was last updated

  - **`webhookId` (required)**

    `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "filters": [
    {
      "webhookId": "123e4567-e89b-12d3-a456-426614174000",
      "filterKey": "sensor",
      "filterValue": "sensor123",
      "filterType": "string",
      "filterOperation": "eq",
      "active": true,
      "createdAt": "2021-01-01T00:00:00Z",
      "updatedAt": "2021-01-01T00:00:00Z",
      "deletedAt": "2021-01-01T00:00:00Z"
    }
  ]
}
```

### Create a webhook filter

- **Method:** `POST`
- **Path:** `/webhook-filters/`
- **Tags:** Webhook Filters

Creates a new webhook filter

#### Request Body

##### Content-Type: application/json

- **`active` (required)**

  `boolean` — Whether the filter is active

- **`filterKey` (required)**

  `string` — The key to filter on

- **`filterOperation` (required)**

  `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

- **`filterType` (required)**

  `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

- **`filterValue` (required)**

  `string` — The value to filter on

- **`webhookId` (required)**

  `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "webhookId": "123e4567-e89b-12d3-a456-426614174000",
  "filterKey": "sensor",
  "filterValue": "sensor123",
  "filterType": "string",
  "filterOperation": "eq",
  "active": true
}
```

#### Responses

##### Status: 201 Webhook filter created successfully

###### Content-Type: application/json

- **`filter` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the filter is active

  - **`createdAt` (required)**

    `string` — The date and time the filter was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the filter was deleted

  - **`filterKey` (required)**

    `string` — The key to filter on

  - **`filterOperation` (required)**

    `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

  - **`filterType` (required)**

    `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

  - **`filterValue` (required)**

    `string` — The value to filter on

  - **`updatedAt` (required)**

    `string` — The date and time the filter was last updated

  - **`webhookId` (required)**

    `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "filter": {
    "webhookId": "123e4567-e89b-12d3-a456-426614174000",
    "filterKey": "sensor",
    "filterValue": "sensor123",
    "filterType": "string",
    "filterOperation": "eq",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

##### Status: 400 Invalid webhook filter data

###### Content-Type: application/json

- **`message` (required)**

  `string`

- **`status` (required)**

  `string`

- **`errors`**

  `object`

**Example:**

```
{
  "status": "error",
  "message": "",
  "errors": null
}
```

### Update a webhook filter

- **Method:** `PUT`
- **Path:** `/webhook-filters/:id`
- **Tags:** Webhook Filters

Updates an existing webhook filter by ID

#### Request Body

##### Content-Type: application/json

- **`active` (required)**

  `boolean` — Whether the filter is active

- **`filterKey` (required)**

  `string` — The key to filter on

- **`filterOperation` (required)**

  `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

- **`filterType` (required)**

  `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

- **`filterValue` (required)**

  `string` — The value to filter on

- **`webhookId` (required)**

  `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "webhookId": "123e4567-e89b-12d3-a456-426614174000",
  "filterKey": "sensor",
  "filterValue": "sensor123",
  "filterType": "string",
  "filterOperation": "eq",
  "active": true
}
```

#### Responses

##### Status: 200 Webhook filter updated successfully

###### Content-Type: application/json

- **`filter` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the filter is active

  - **`createdAt` (required)**

    `string` — The date and time the filter was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the filter was deleted

  - **`filterKey` (required)**

    `string` — The key to filter on

  - **`filterOperation` (required)**

    `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

  - **`filterType` (required)**

    `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

  - **`filterValue` (required)**

    `string` — The value to filter on

  - **`updatedAt` (required)**

    `string` — The date and time the filter was last updated

  - **`webhookId` (required)**

    `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "filter": {
    "webhookId": "123e4567-e89b-12d3-a456-426614174000",
    "filterKey": "sensor",
    "filterValue": "sensor123",
    "filterType": "string",
    "filterOperation": "eq",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

##### Status: 400 Invalid webhook filter data

###### Content-Type: application/json

- **`message` (required)**

  `string`

- **`status` (required)**

  `string`

- **`errors`**

  `object`

**Example:**

```
{
  "status": "error",
  "message": "",
  "errors": null
}
```

### Get a webhook filter by ID

- **Method:** `GET`
- **Path:** `/webhook-filters/{id}`
- **Tags:** Webhook Filters

Returns a specific webhook filter by ID

#### Responses

##### Status: 200 Webhook filter retrieved successfully

###### Content-Type: application/json

- **`filter` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the filter is active

  - **`createdAt` (required)**

    `string` — The date and time the filter was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the filter was deleted

  - **`filterKey` (required)**

    `string` — The key to filter on

  - **`filterOperation` (required)**

    `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

  - **`filterType` (required)**

    `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

  - **`filterValue` (required)**

    `string` — The value to filter on

  - **`updatedAt` (required)**

    `string` — The date and time the filter was last updated

  - **`webhookId` (required)**

    `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "filter": {
    "webhookId": "123e4567-e89b-12d3-a456-426614174000",
    "filterKey": "sensor",
    "filterValue": "sensor123",
    "filterType": "string",
    "filterOperation": "eq",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

### Delete a webhook filter

- **Method:** `DELETE`
- **Path:** `/webhook-filters/{id}`
- **Tags:** Webhook Filters

Deletes a webhook filter by ID

#### Responses

##### Status: 200 Webhook filter deleted successfully

###### Content-Type: application/json

- **`message` (required)**

  `string`

- **`status` (required)**

  `string`

- **`errors`**

  `object`

**Example:**

```
{
  "status": "success",
  "message": "",
  "errors": null
}
```

### Get webhook filters by webhook ID

- **Method:** `GET`
- **Path:** `/webhook-filters/webhook/{webhookId}`
- **Tags:** Webhook Filters

Returns all filters for a specific webhook

#### Responses

##### Status: 200 Webhook filters retrieved successfully

###### Content-Type: application/json

- **`filters` (required)**

  `array`

  **Items:**

  - **`active` (required)**

    `boolean` — Whether the filter is active

  - **`createdAt` (required)**

    `string` — The date and time the filter was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the filter was deleted

  - **`filterKey` (required)**

    `string` — The key to filter on

  - **`filterOperation` (required)**

    `string`, possible values: `"eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "in", "notIn", "startsWith", "endsWith", "regexp"` — The operation to perform on the filter value

  - **`filterType` (required)**

    `string`, possible values: `"string", "number", "boolean"` — The type of the filter value

  - **`filterValue` (required)**

    `string` — The value to filter on

  - **`updatedAt` (required)**

    `string` — The date and time the filter was last updated

  - **`webhookId` (required)**

    `string` — The unique identifier for the webhook, in UUID format

**Example:**

```
{
  "filters": [
    {
      "webhookId": "123e4567-e89b-12d3-a456-426614174000",
      "filterKey": "sensor",
      "filterValue": "sensor123",
      "filterType": "string",
      "filterOperation": "eq",
      "active": true,
      "createdAt": "2021-01-01T00:00:00Z",
      "updatedAt": "2021-01-01T00:00:00Z",
      "deletedAt": "2021-01-01T00:00:00Z"
    }
  ]
}
```

### Get webhooks for a sensor

- **Method:** `GET`
- **Path:** `/webhooks/`
- **Tags:** Webhooks

Returns all webhooks for a specific sensor

#### Responses

##### Status: 200 Webhooks retrieved successfully

###### Content-Type: application/json

- **`webhooks` (required)**

  `array`

  **Items:**

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhooks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "sensor": "sensor123",
      "name": "My Webhook",
      "description": "This webhook is used to send data to the example.com/webhook",
      "targetUrl": "https://example.com/webhook",
      "secret": "secret123",
      "active": true,
      "createdAt": "2021-01-01T00:00:00Z",
      "updatedAt": "2021-01-01T00:00:00Z",
      "deletedAt": "2021-01-01T00:00:00Z"
    }
  ]
}
```

### Create a webhook

- **Method:** `POST`
- **Path:** `/webhooks/`
- **Tags:** Webhooks

Creates a new webhook

#### Request Body

##### Content-Type: application/json

- **`active` (required)**

  `boolean` — Whether the webhook is active

- **`description` (required)**

  `string | null` — The description of the webhook

- **`name` (required)**

  `string` — The name of the webhook

- **`secret` (required)**

  `string` — The secret that the webhook will use to authenticate the data

- **`targetUrl` (required)**

  `string` — The URL that the webhook will send the data to

- **`sensor`**

  `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "sensor": "sensor123",
  "name": "My Webhook",
  "description": "This webhook is used to send data to the example.com/webhook",
  "targetUrl": "https://example.com/webhook",
  "secret": "secret123",
  "active": true
}
```

#### Responses

##### Status: 201 Webhook created successfully

###### Content-Type: application/json

- **`webhook` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhook": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sensor": "sensor123",
    "name": "My Webhook",
    "description": "This webhook is used to send data to the example.com/webhook",
    "targetUrl": "https://example.com/webhook",
    "secret": "secret123",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

##### Status: 400 Invalid webhook data

###### Content-Type: application/json

- **`details` (required)**

  `array`

  **Items:**

  - **`code` (required)**

    `string` — The code of the error

  - **`expected` (required)**

    `string` — The expected value

  - **`message` (required)**

    `string` — The message of the error

  - **`path` (required)**

    `array` — The path of the error

    **Items:**

    `string`

  - **`received` (required)**

    `string` — The received value

- **`error` (required)**

  `string` — The error message

**Example:**

```
{
  "error": "An error occurred",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": [
        "sensor"
      ],
      "message": "Required"
    }
  ]
}
```

### Get a specific webhook

- **Method:** `GET`
- **Path:** `/webhooks/:id`
- **Tags:** Webhooks

Returns a specific webhook by ID

#### Responses

##### Status: 200 Webhook retrieved successfully

###### Content-Type: application/json

- **`webhook` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhook": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sensor": "sensor123",
    "name": "My Webhook",
    "description": "This webhook is used to send data to the example.com/webhook",
    "targetUrl": "https://example.com/webhook",
    "secret": "secret123",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

### Update a webhook

- **Method:** `PUT`
- **Path:** `/webhooks/:id`
- **Tags:** Webhooks

Updates an existing webhook by ID

#### Request Body

##### Content-Type: application/json

- **`active` (required)**

  `boolean` — Whether the webhook is active

- **`description` (required)**

  `string | null` — The description of the webhook

- **`name` (required)**

  `string` — The name of the webhook

- **`secret` (required)**

  `string` — The secret that the webhook will use to authenticate the data

- **`targetUrl` (required)**

  `string` — The URL that the webhook will send the data to

- **`sensor`**

  `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "sensor": "sensor123",
  "name": "My Webhook",
  "description": "This webhook is used to send data to the example.com/webhook",
  "targetUrl": "https://example.com/webhook",
  "secret": "secret123",
  "active": true
}
```

#### Responses

##### Status: 200 Webhook updated successfully

###### Content-Type: application/json

- **`webhook` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhook": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sensor": "sensor123",
    "name": "My Webhook",
    "description": "This webhook is used to send data to the example.com/webhook",
    "targetUrl": "https://example.com/webhook",
    "secret": "secret123",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

##### Status: 400 Invalid webhook data

###### Content-Type: application/json

- **`details` (required)**

  `array`

  **Items:**

  - **`code` (required)**

    `string` — The code of the error

  - **`expected` (required)**

    `string` — The expected value

  - **`message` (required)**

    `string` — The message of the error

  - **`path` (required)**

    `array` — The path of the error

    **Items:**

    `string`

  - **`received` (required)**

    `string` — The received value

- **`error` (required)**

  `string` — The error message

**Example:**

```
{
  "error": "An error occurred",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": [
        "sensor"
      ],
      "message": "Required"
    }
  ]
}
```

### Delete a webhook

- **Method:** `DELETE`
- **Path:** `/webhooks/:id`
- **Tags:** Webhooks

Deletes a webhook by ID

#### Responses

##### Status: 200 Webhook deleted successfully

###### Content-Type: application/json

- **`message` (required)**

  `string`

- **`status` (required)**

  `string`

- **`errors`**

  `object`

**Example:**

```
{
  "status": "success",
  "message": "",
  "errors": null
}
```

### Activate a webhook

- **Method:** `PUT`
- **Path:** `/webhooks/:id/activate`
- **Tags:** Webhooks

Activates a webhook by ID

#### Responses

##### Status: 200 Webhook activated successfully

###### Content-Type: application/json

- **`webhook` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhook": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sensor": "sensor123",
    "name": "My Webhook",
    "description": "This webhook is used to send data to the example.com/webhook",
    "targetUrl": "https://example.com/webhook",
    "secret": "secret123",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```

### Deactivate a webhook

- **Method:** `PUT`
- **Path:** `/webhooks/:id/deactivate`
- **Tags:** Webhooks

Deactivates a webhook by ID

#### Responses

##### Status: 200 Webhook deactivated successfully

###### Content-Type: application/json

- **`webhook` (required)**

  `object`

  - **`active` (required)**

    `boolean` — Whether the webhook is active

  - **`createdAt` (required)**

    `string | null` — The date and time the webhook was created

  - **`deletedAt` (required)**

    `string | null` — The date and time the webhook was deleted

  - **`description` (required)**

    `string | null` — The description of the webhook

  - **`id` (required)**

    `string` — The unique identifier for the webhook

  - **`name` (required)**

    `string` — The name of the webhook

  - **`secret` (required)**

    `string` — The secret that the webhook will use to authenticate the data

  - **`targetUrl` (required)**

    `string` — The URL that the webhook will send the data to

  - **`updatedAt` (required)**

    `string` — The date and time the webhook was last updated

  - **`sensor`**

    `string | null` — The sensor that the webhook is associated with

**Example:**

```
{
  "webhook": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sensor": "sensor123",
    "name": "My Webhook",
    "description": "This webhook is used to send data to the example.com/webhook",
    "targetUrl": "https://example.com/webhook",
    "secret": "secret123",
    "active": true,
    "createdAt": "2021-01-01T00:00:00Z",
    "updatedAt": "2021-01-01T00:00:00Z",
    "deletedAt": "2021-01-01T00:00:00Z"
  }
}
```
