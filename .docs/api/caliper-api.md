# Caliper API

> Generated from: https://caliper.alpha-1edtech.com/caliper/openapi.yaml
> Generated on: 2025-09-18T03:08:06.814Z

---

# Caliper API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

# Documentation

## Overview

The Alpha Caliper API is a service that receives, validates, and processes learning events conforming to the [IMS Caliper Analytics® specification](https://www.imsglobal.org/spec/caliper/v1p2). This API enables educational technology platforms to track and analyze student engagement, learning activities, and assessment outcomes.

## Key Features

- **Event Validation**: Ensures all submitted events conform to the Caliper Analytics specification
- **Event Processing**: Processes and stores valid events for analytics
- **Multiple Event Profiles**: Supports various Caliper event profiles

## Getting Started

To use this API, you need to:

1. **Familiarize with Caliper**: Understand the [IMS Caliper Analytics specification](https://www.imsglobal.org/spec/caliper/v1p2)
2. **Format Your Events**: Structure your events according to the Caliper data model
3. **Submit Events**: Send events to our API endpoints wrapped in a Caliper envelope

***

# Frequently Asked Questions

## Purpose of the API

Q: **What is the purpose of the Alpha Caliper API?**

A: Receive, validate and store learning events conforming to the [IMS Caliper Analytics® specification](https://www.imsglobal.org/spec/caliper/v1p2).

***

## Out of scope

Q: **What is not the (direct) purpose of the Alpha Caliper API?**

A:

- Generate insights from events. (ETL)
- Provide a learning analytics platform.
- Provide a learning content management system.
- Raw crud apis.

***

## Insights generation

Q: **Does Caliper have an ETL layer to extract insights from the events sent?**

A: No, caliper is only responsible for storing the events, other services may implement an ETL layer to extract insights from specific events. Caliper acts like a data warehouse, it's purpose is to store events and make them available for reporting and analytics.

***

## Specific Use-cases

Q: **Which events should I send?**

A: The Alpha Caliper API supports the entire Caliper specification. We also extended the base spec to contain specific events for the Timeback platform.

- If you are using the Timeback platform, take a look at the section below for supported use-cases.
- If your use-case is not supported, please contact us to discuss how we can extend the spec to support your use-case.
- If you want your events to be processed by the Alpha Analytics API (ETL), you need to conform to the TimeBack Profile and it's supported events.

***

# Timeback Platform Users

## Guide

If you are a user of the timeback platform you may have these questions:

- Q: **How do I give XP to my students?**
- Q: **How do I record time spent on activities?**
- Q: **How do I provided information about total questions, correct answers, etc?**

A: Use The **Timeback Profile**, which is a profile that extends the base Caliper specification to support the Timeback platform.

It contains the following events:

- **TimebackActivityEvent** - used to record student interaction with an activity.
- **TimebackTimeSpentEvent** - used to record the time spent on an activity.

See the timeback docs for more information:

[Timeback Docs](https://caliper.alpha-1edtech.com/scalar?api=timeback-events-api)

***

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
  - **Description:** Caliper API

## Operations

### Get job status

- **Method:** `GET`
- **Path:** `/jobs/{jobId}/status`
- **Tags:** Jobs

Returns the current status of a job including processing progress and assigned event IDs if completed

#### Responses

##### Status: 200 Job status retrieved successfully

###### Content-Type: application/json

- **`job` (required)**

  `object`

  - **`id` (required)**

    `string`

  - **`processedOn` (required)**

    `string | null`

  - **`returnValue` (required)**

    `object`

    - **`results` (required)**

      `array`

      **Items:**

      - **`allocatedId` (required)**

        `string`

      - **`externalId` (required)**

        `string`

    - **`status` (required)**

      `string`

  - **`state` (required)**

    `string`

**Example:**

```
{
  "job": {
    "id": "6",
    "state": "completed",
    "returnValue": {
      "status": "success",
      "results": [
        {
          "allocatedId": "7",
          "externalId": "urn:uuid:cadcb833-551e-487b-8213-007f89e74ddf"
        }
      ]
    },
    "processedOn": "2025-07-28T15:15:28.330Z"
  }
}
```

##### Status: 404 Job not found

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

### Create Caliper Events

- **Method:** `POST`
- **Path:** `/caliper/event`
- **Tags:** Caliper Events

Receives and processes Caliper events wrapped in an envelope. Events will be validated against the IMS Caliper Analytics specification and stored for further processing and analysis.

#### Request Body

##### Content-Type: application/json

- **`data` (required)**

  `array` — The data payload, consisting of an array where items are Caliper Events or Entities

  **Items:**

  **Any of:**

  - **`action` (required)**

    `string` — The action or predicate that binds the actor to the object

  - **`actor` (required)**

    `string | object` — The agent who initiated the event

  - **`eventTime` (required)**

    `string`, format: `date-time` — ISO 8601 datetime when this event occurred

  - **`id` (required)**

    `string` — Unique identifier for this event. Must be a UUID expressed as a URN

  - **`object` (required)**

    `string | object` — The object of the interaction

  - **`profile` (required)**

    `object` — The profile that governs interpretation of this event

  - **`type` (required)**

    `string` — The type of this event. Must match the term specified in the Caliper information model

  - **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  - **`edApp`**

    `string | object` — The application context

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`federatedSession`**

    `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

  - **`generated`**

    `string | object` — Entity generated as a result of the interaction

  - **`group`**

    `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

  - **`membership`**

    `string | object` — The relationship between the action and the group in terms of roles and status

  - **`referrer`**

    `string | object` — Entity that represents the referring context

  - **`session`**

    `string | object` — The current user Session

  - **`target`**

    `string | object` — Entity that represents a particular segment or location within the object

  * **`id` (required)**

    `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

  * **`type` (required)**

    `string` — The type of this entity. Must match the term specified in the Caliper information model

  * **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  * **`dateCreated`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was created

  * **`dateModified`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

  * **`description`**

    `string` — A brief, written representation of the entity

  * **`extensions`**

    `object` — Additional attributes not defined by the model

  * **`name`**

    `string` — A word or phrase by which the entity is known

  * **`otherIdentifiers`**

    `array`

    **Items:**

    `[ "string", "object" ]`

- **`dataVersion` (required)**

  `string` — The data format version. Indicates which version of the Caliper specification governs the form of the entities and events

- **`sendTime` (required)**

  `string`, format: `date-time` — The time the data was sent, formatted as an ISO 8601 date and time in UTC

- **`sensor` (required)**

  `string`, format: `uri` — The sensor.id that uniquely identifies the Caliper Sensor. Should be in the form of an IRI

**Example:**

```
{
  "sensor": "https://example.edu/sensors/1",
  "sendTime": "2023-08-15T14:12:00.000Z",
  "dataVersion": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "data": [
    {
      "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
      "type": "Event",
      "actor": "https://example.edu/users/554433",
      "action": "Created",
      "object": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1",
      "eventTime": "2023-08-15T14:12:00.000Z"
    }
  ]
}
```

#### Responses

##### Status: 200 The events were processed successfully

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

##### Status: 400 The request payload is invalid

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

### Validate Caliper Events

- **Method:** `POST`
- **Path:** `/caliper/event/validate`
- **Tags:** Caliper Events

Validate Caliper Events

#### Request Body

##### Content-Type: application/json

- **`data` (required)**

  `array` — The data payload, consisting of an array where items are Caliper Events or Entities

  **Items:**

  **Any of:**

  - **`action` (required)**

    `string` — The action or predicate that binds the actor to the object

  - **`actor` (required)**

    `string | object` — The agent who initiated the event

  - **`eventTime` (required)**

    `string`, format: `date-time` — ISO 8601 datetime when this event occurred

  - **`id` (required)**

    `string` — Unique identifier for this event. Must be a UUID expressed as a URN

  - **`object` (required)**

    `string | object` — The object of the interaction

  - **`profile` (required)**

    `object` — The profile that governs interpretation of this event

  - **`type` (required)**

    `string` — The type of this event. Must match the term specified in the Caliper information model

  - **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  - **`edApp`**

    `string | object` — The application context

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`federatedSession`**

    `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

  - **`generated`**

    `string | object` — Entity generated as a result of the interaction

  - **`group`**

    `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

  - **`membership`**

    `string | object` — The relationship between the action and the group in terms of roles and status

  - **`referrer`**

    `string | object` — Entity that represents the referring context

  - **`session`**

    `string | object` — The current user Session

  - **`target`**

    `string | object` — Entity that represents a particular segment or location within the object

  * **`id` (required)**

    `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

  * **`type` (required)**

    `string` — The type of this entity. Must match the term specified in the Caliper information model

  * **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  * **`dateCreated`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was created

  * **`dateModified`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

  * **`description`**

    `string` — A brief, written representation of the entity

  * **`extensions`**

    `object` — Additional attributes not defined by the model

  * **`name`**

    `string` — A word or phrase by which the entity is known

  * **`otherIdentifiers`**

    `array`

    **Items:**

    `[ "string", "object" ]`

- **`dataVersion` (required)**

  `string` — The data format version. Indicates which version of the Caliper specification governs the form of the entities and events

- **`sendTime` (required)**

  `string`, format: `date-time` — The time the data was sent, formatted as an ISO 8601 date and time in UTC

- **`sensor` (required)**

  `string`, format: `uri` — The sensor.id that uniquely identifies the Caliper Sensor. Should be in the form of an IRI

**Example:**

```
{
  "sensor": "https://example.edu/sensors/1",
  "sendTime": "2023-08-15T14:12:00.000Z",
  "dataVersion": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "data": [
    {
      "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
      "type": "Event",
      "actor": "https://example.edu/users/554433",
      "action": "Created",
      "object": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1",
      "eventTime": "2023-08-15T14:12:00.000Z"
    }
  ]
}
```

#### Responses

##### Status: 200 The request payload is valid

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

##### Status: 400 The request payload is invalid

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

### List Caliper Events

- **Method:** `GET`
- **Path:** `/caliper/events`
- **Tags:** Caliper Events

List Caliper Events

#### Responses

##### Status: 200 The events were retrieved successfully

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

##### Status: 400 The request payload is invalid

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

### Get Caliper Event by External ID

- **Method:** `GET`
- **Path:** `/caliper/events/:externalId`
- **Tags:** Caliper Events

Get Caliper Event by External ID

#### Responses

##### Status: 200 The event was retrieved successfully

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

##### Status: 404 Event not found

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

## Schemas

### Envelope

- **Type:**`object`

# Envelope

Represents a package containing events and entity data for ingestion

- **`data` (required)**

  `array` — The data payload, consisting of an array where items are Caliper Events or Entities

  **Items:**

  **Any of:**

  - **`action` (required)**

    `string` — The action or predicate that binds the actor to the object

  - **`actor` (required)**

    `string | object` — The agent who initiated the event

  - **`eventTime` (required)**

    `string`, format: `date-time` — ISO 8601 datetime when this event occurred

  - **`id` (required)**

    `string` — Unique identifier for this event. Must be a UUID expressed as a URN

  - **`object` (required)**

    `string | object` — The object of the interaction

  - **`profile` (required)**

    `object` — The profile that governs interpretation of this event

  - **`type` (required)**

    `string` — The type of this event. Must match the term specified in the Caliper information model

  - **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  - **`edApp`**

    `string | object` — The application context

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`federatedSession`**

    `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

  - **`generated`**

    `string | object` — Entity generated as a result of the interaction

  - **`group`**

    `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

  - **`membership`**

    `string | object` — The relationship between the action and the group in terms of roles and status

  - **`referrer`**

    `string | object` — Entity that represents the referring context

  - **`session`**

    `string | object` — The current user Session

  - **`target`**

    `string | object` — Entity that represents a particular segment or location within the object

  * **`id` (required)**

    `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

  * **`type` (required)**

    `string` — The type of this entity. Must match the term specified in the Caliper information model

  * **`@context`**

    `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

  * **`dateCreated`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was created

  * **`dateModified`**

    `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

  * **`description`**

    `string` — A brief, written representation of the entity

  * **`extensions`**

    `object` — Additional attributes not defined by the model

  * **`name`**

    `string` — A word or phrase by which the entity is known

  * **`otherIdentifiers`**

    `array`

    **Items:**

    `[ "string", "object" ]`

- **`dataVersion` (required)**

  `string` — The data format version. Indicates which version of the Caliper specification governs the form of the entities and events

- **`sendTime` (required)**

  `string`, format: `date-time` — The time the data was sent, formatted as an ISO 8601 date and time in UTC

- **`sensor` (required)**

  `string`, format: `uri` — The sensor.id that uniquely identifies the Caliper Sensor. Should be in the form of an IRI

**Example:**

```
{
  "sensor": "https://example.edu/sensors/1",
  "sendTime": "2023-08-15T14:12:00.000Z",
  "dataVersion": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "data": [
    {
      "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
      "type": "Event",
      "actor": "https://example.edu/users/554433",
      "action": "Created",
      "object": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1",
      "eventTime": "2023-08-15T14:12:00.000Z"
    }
  ]
}
```

### Event

- **Type:**`object`

# Event

Represents a Caliper Event that describes learning activities

- **`action` (required)**

  `string` — The action or predicate that binds the actor to the object

- **`actor` (required)**

  `string | object` — The agent who initiated the event

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The object of the interaction

- **`profile` (required)**

  `object` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must match the term specified in the Caliper information model

- **`@context`**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "Event",
  "actor": "https://example.edu/users/554433",
  "action": "Created",
  "object": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AnnotationProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AllProfiles

- **Type:**`string`

# Supported Profiles

These are the profiles that this API currently supports.

See the [specification](https://www.imsglobal.org/spec/caliper/v1p2#profiles-0) for a list of all profiles.

**Example:**

### AllAgents

- **Type:**

# Supported Agents

These are the agents that this API currently supports.

See the [specification](https://www.imsglobal.org/spec/caliper/v1p2#Agent) for a list of all agents.

**Example:**

### AllAnnotations

- **Type:**

**Example:**

### AllDigitalResources

- **Type:**

**Example:**

### AllScales

- **Type:**

**Example:**

### AllResponses

- **Type:**

**Example:**

### AggregateMeasure

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

* **`metric` (required)**

  `string` — The type of metric being measured

* **`metricValue` (required)**

  `number` — A decimal value representing the total curricular progress the actor has made in the context of the application.

* **`type` (required)**

  `string` — The type of this entity. Must be set to 'AggregateMeasure'

* **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

* **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

* **`description`**

  `string` — A brief, written representation of the entity

* **`endedAtTime`**

  `string`, format: `date-time` — The date and time when the metric aggregation was completed

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`maxMetricValue`**

  `number` — A decimal value representing the maximum possible value for the metric in this context.

* **`name`**

  `string` — A word or phrase by which the entity is known

* **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

* **`startedAtTime`**

  `string`, format: `date-time` — The date and time when the metric aggregation started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "AggregateMeasure",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "metricValue": 42,
  "maxMetricValue": 100,
  "metric": "MinutesOnTask",
  "startedAtTime": "2023-08-15T14:12:00.000Z",
  "endedAtTime": "2023-08-15T14:12:00.000Z"
}
```

### AggregateMeasureCollection

- **Type:**`object`

A collection of AggregateMeasure entities

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`items` (required)**

  `array` — The collection of aggregate measures

  **Items:**

  `[ "string", "object" ]`

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'AggregateMeasureCollection'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "AggregateMeasureCollection",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "items": [
    "https://example.edu/measures/001",
    "https://example.edu/measures/002",
    {
      "type": "AggregateMeasure",
      "id": "https://example.edu/measures/003",
      "metric": "MinutesOnTask",
      "metricValue": 42,
      "maxMetricValue": 100,
      "startedAtTime": "2023-08-15T14:12:00.000Z",
      "endedAtTime": "2023-08-15T14:12:00.000Z"
    }
  ]
}
```

### Assessment

- **Type:**`object`

# Assessment

Represents an assessment such as a quiz or test

- **`type` (required)**

  `string` — The type of the digital resource

- **`items`**

  `array` — The items of the assessment. See \[@AssessmentItem]\(#model/assessmentitem)

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "type": "Assessment",
  "items": [
    {
      "type": "AssessmentItem",
      "id": "123",
      "name": "Assessment Item 1"
    }
  ]
}
```

### AssessmentItem

- **Type:**`object`

# AssessmentItem

Represents an assessment item such as a question or assignment

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of the digital resource

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`dateToActivate`**

  `string`, format: `date-time` — The datetime when this was activated

- **`dateToShow`**

  `string`, format: `date-time` — describes when the resource should be shown or made available to learners

- **`dateToStartOn`**

  `string`, format: `date-time` — The datetime when this resource becomes available to learners

- **`dateToSubmit`**

  `string`, format: `date-time` — The datetime when this resource is due

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`isTimeDependent`**

  `boolean` — A boolean value indicating whether or not interacting with the item is time dependent.

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`maxAttempts`**

  `number` — A non-negative integer that designates the number of permitted attempts.

- **`maxScore`**

  `number` — The maximum possible score for this assignable resource

- **`maxSubmits`**

  `number` — A non-negative integer that designates the number of permitted submissions.

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "AssessmentItem",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "dateToActivate": "2023-08-15T14:00:00.000Z",
  "dateToShow": "2023-08-15T14:00:00.000Z",
  "dateToStartOn": "2023-08-15T14:00:00.000Z",
  "dateToSubmit": "2023-08-22T23:59:59.000Z",
  "maxAttempts": 3,
  "maxSubmits": 3,
  "maxScore": 100,
  "isTimeDependent": false
}
```

### AllAssignableDigitalResources

- **Type:**

**Example:**

### Attempt

- **Type:**`object`

# Attempt

A Caliper Attempt provides a count of the number of times an actor has interacted with a DigitalResource along with start time, end time and duration information. An Attempt is generated as the result of an action such as starting an Assessment or Questionnaire.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`assignable`**

  `string | object` — The DigitalResource that constitutes the object of the assignment.

- **`assignee`**

  `string | object` — The person that is assigned to the response

- **`count`**

  `number` — The total number of attempts inclusive of the current attempt that have been registered against the assigned DigitalResource.

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Attempt",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "assignee": "https://example.edu/users/554433",
  "assignable": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1",
  "count": 1,
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S"
}
```

### AudioObject

- **Type:**`object`

# AudioObject

Represents an audio object

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — An optional time interval that represents the total time required to view and/or listen to the MediaObject at normal speed. If a duration is specified the value MUST conform to the ISO 8601 duration format.

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`muted`**

  `boolean` — A boolean value indicating whether the audio is muted.

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

- **`volumeLevel`**

  `string` — A string value indicating the current volume level.

- **`volumeMax`**

  `string` — A string value indicating the maximum volume level permitted.

- **`volumeMin`**

  `string` — A string value indicating the minimum volume level permitted.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "AudioObject",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "duration": "PT1H17M50S",
  "volumeLevel": "50%",
  "volumeMin": "50%",
  "volumeMax": "50%",
  "muted": true
}
```

### BookmarkAnnotation

- **Type:**`object`

# BookmarkAnnotation

A bookmark annotation represents the act of marking a DigitalResource at a particular location.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`annotated` (required)**

  `string | object`

- **`annotator` (required)**

  `string | object` — The person that made the annotation

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'BookmarkAnnotation'

- **`bookmarkNotes`**

  `string` — Notes about the bookmark

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "BookmarkAnnotation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "annotator": "https://example.edu/users/554433",
  "annotated": "",
  "bookmarkNotes": "Remember to review this section"
}
```

### Chapter

- **Type:**`object`

# Chapter

Represents a major sub-division of a larger work such as a book

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Chapter'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Chapter",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0"
}
```

### Collection

- **Type:**`object`

Represents an ordered collection of items

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`items` (required)**

  `array` — An ordered collection of items that comprise the collection

  **Items:**

  `[ "string", "object" ]` — An ordered collection of items that comprise the collection

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Collection'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Collection",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "items": [
    "https://example.edu/items/1",
    "https://example.edu/items/2",
    "https://example.edu/items/3"
  ]
}
```

### Comment

- **Type:**`object`

# Comment

Represents a comment on an entity

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Comment'

- **`commentedOn`**

  `string | object` — The Entity which received the comment

- **`commenter`**

  `string | object` — The person who provided the comment

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`value`**

  `string` — A string value representing the comment's textual value.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Comment",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "commenter": "https://example.edu/users/554433",
  "commentedOn": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf",
  "value": "This is a comment"
}
```

### CourseOffering

- **Type:**`object`

# CourseOffering

A CourseOffering is a specific instance of a Course

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this organization. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`academicSession`**

  `string` — The academic session of the offering

- **`courseNumber`**

  `string` — A string value that constitutes a human-readable identifier for the CourseOffering.

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`members`**

  `array` — The members of this Organization

  **Items:**

  `[ "string", "object" ]`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`subOrganizationOf`**

  `string | object` — The parent Organization of this Organization

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/terms/201601/courses/7",
  "type": "CourseOffering",
  "courseNumber": "CPS 435",
  "academicSession": "Fall 2016",
  "name": "CPS 435 Learning Analytics",
  "otherIdentifiers": [
    {
      "type": "SystemIdentifier",
      "identifier": "example.edu:SI182-F16",
      "identifierType": "LisSourcedId"
    }
  ],
  "dateCreated": "2016-08-01T06:00:00.000Z",
  "dateModified": "2016-09-02T11:30:00.000Z"
}
```

### CourseSection

- **Type:**`object`

# CourseSection

A CourseSection is a specific instance of a CourseOffering

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this organization. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`academicSession`**

  `string` — The academic session of the offering

- **`category`**

  `string` — A string value that characterizes the purpose of the section such as lecture, lab or seminar.

- **`courseNumber`**

  `string` — A string value that constitutes a human-readable identifier for the CourseOffering.

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`members`**

  `array` — The members of this Organization

  **Items:**

  `[ "string", "object" ]`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`subOrganizationOf`**

  `string | object` — The parent Organization of this Organization

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/terms/201601/courses/7/sections/1",
  "type": "CourseSection",
  "academicSession": "Fall 2016",
  "courseNumber": "CPS 435-01",
  "name": "CPS 435 Learning Analytics, Section 01",
  "otherIdentifiers": [
    {
      "type": "SystemIdentifier",
      "identifier": "example.edu:SI182-001-F16",
      "identifierType": "LisSourcedId"
    }
  ],
  "category": "seminar",
  "subOrganizationOf": {
    "id": "https://example.edu/terms/201601/courses/7",
    "type": "CourseOffering",
    "courseNumber": "CPS 435"
  },
  "dateCreated": "2016-08-01T06:00:00.000Z"
}
```

### DateTimeResponse

- **Type:**`object`

A response to a datetime question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`dateTimeSelected`**

  `string`, format: `date-time` — The DateTime selected in response to the question.

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "DateTimeResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "dateTimeSelected": "2021-01-01T00:00:00Z"
}
```

### DigitalResourceCollection

- **Type:**`object`

# DigitalResourceCollection

Represents a collection of digital resources

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'DigitalResourceCollection'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`items`**

  `array` — An ordered collection of DigitalResource entities

  **Items:**

  `[ "string", "object" ]`

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "DigitalResourceCollection",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "items": [
    "https://example.edu/resources/1",
    "https://example.edu/resources/2"
  ]
}
```

### Document

- **Type:**`object`

# Document

Represents a written work in digital form

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Document'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Document",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0"
}
```

### FillinBlankResponse

- **Type:**`object`

A response to a fill in the blank question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`values`**

  `array` — An ordered collection of one or more string values representing words, expressions or short phrases that constitute the "fill in the blank" response.

  **Items:**

  `string`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "FillinBlankResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "values": [
    "The answer is 42"
  ]
}
```

### Forum

- **Type:**`object`

# Forum

A Caliper Forum represents a channel or virtual space in which group discussions take place. A Forum typically comprises one or more threaded conversations to which members can subscribe, post messages and reply to other messages.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`items`**

  `array` — An ordered collection of Thread entities.

  **Items:**

  `[ "string", "object" ]`

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Forum",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "items": [
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1",
      "type": "Thread",
      "name": "Caliper Information Model",
      "dateCreated": "2016-11-01T09:30:00.000Z"
    },
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/2",
      "type": "Thread",
      "name": "Caliper Sensor API",
      "dateCreated": "2016-11-01T09:30:00.000Z"
    },
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/3",
      "type": "Thread",
      "name": "Caliper Certification",
      "dateCreated": "2016-11-01T09:30:00.000Z"
    }
  ]
}
```

### Frame

- **Type:**`object`

# Frame

A Caliper Frame represents a part, portion or segment of a DigitalResource, such as a book chapter or video segment

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Frame'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`index`**

  `number` — The position of this frame within its parent digital resource

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Frame",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "index": 1
}
```

### Group

- **Type:**`object`

# Group

Represents a group such as a company, school, or other organization

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this organization. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this agent. Must be set to 'Organization'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`members`**

  `array` — The members of this Organization

  **Items:**

  `[ "string", "object" ]`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`subOrganizationOf`**

  `string | object` — The parent Organization of this Organization

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/organization/554433",
  "type": "Group",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "subOrganizationOf": "https://example.edu/organizations/schools/law",
  "members": [
    "https://example.edu/users/554433"
  ]
}
```

### HighlightAnnotation

- **Type:**`object`

# HighlightAnnotation

represents the act of marking a particular segment of a DigitalResource between two known coordinates.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`annotated` (required)**

  `string | object`

- **`annotator` (required)**

  `string | object` — The person that made the annotation

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'HighlightAnnotation'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`selection`**

  `object` — The text selection that was highlighted with start and end positions

  - **`end` (required)**

    `number`

  - **`start` (required)**

    `number`

  - **`type` (required)**

    `string`

- **`selectionText`**

  `string` — The text that was highlighted

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "HighlightAnnotation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "annotator": "https://example.edu/users/554433",
  "annotated": "",
  "selection": {
    "type": "TextPositionSelector",
    "start": 1,
    "end": 1
  },
  "selectionText": "The quick brown fox jumps over the lazy dog"
}
```

### ImageObject

- **Type:**`object`

# ImageObject

Represents an image object

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — An optional time interval that represents the total time required to view and/or listen to the MediaObject at normal speed. If a duration is specified the value MUST conform to the ISO 8601 duration format.

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "ImageObject",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "duration": "PT1H17M50S"
}
```

### LearningObjective

- **Type:**`object`

# LearningObjective

Represents a statement of what a learner should know or be able to do

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'LearningObjective'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "LearningObjective",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ]
}
```

### LikertScale

- **Type:**`object`

# LikertScale

A Caliper LikertScale models a Likert scale employed in order to capture some likert rating.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of scale, must be LikertScale

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`itemLabels`**

  `array` — The ordered list of labels for each point on the scale. The values MUST be cast as strings.

  **Items:**

  `string`

- **`itemValues`**

  `array` — The ordered list of values for each point on the scale. The values MUST be cast as strings.

  **Items:**

  `string`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`scalePoints`**

  `number` — A integer value used to determine the amount of points on the LikertScale.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/scale/1",
  "type": "Scale",
  "dateCreated": "2018-08-01T06:00:00.000Z"
}
```

### Link

- **Type:**`object`

# Link

The Link entity represents a URL that might be a UI workflow or service endpoint (transient or otherwise), and not necessarily a proper DigitalResource (such as a WebPage or LtiLink).

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Link",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ]
}
```

### LtiSession

- **Type:**`object`

Represents a learning tools interoperability (LTI) session

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'LtiSession'

- **`client`**

  `string | object` — The client application used to initiate the session

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `integer` — Duration of the session in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — ISO 8601 datetime when the session ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`messageParameters`**

  `object` — The message parameters associated with the LTI session

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — ISO 8601 datetime when the session started

- **`user`**

  `string | object` — The user who initiated the session

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "LtiSession",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "user": "https://example.edu/users/554433",
  "startedAtTime": "2023-08-15T14:12:00.000Z",
  "endedAtTime": "2023-08-15T15:12:00.000Z",
  "duration": 3600,
  "client": "https://example.edu/software/1234",
  "messageParameters": {
    "iss": "https://example.edu/oauth/iss",
    "sub": "https://example.edu/users/554433",
    "aud": [
      "https://example.com/lti/tool"
    ],
    "exp": 1510185728,
    "iat": 1510185228,
    "azp": "962fa4d8-bcbf-49a0-94b2-2de05ad274af",
    "nonce": "fc5fdc6d-5dd6-47f4-b2c9-5d1216e9b771",
    "name": "Ms Jane Marie Doe",
    "given_name": "Jane",
    "family_name": "Doe",
    "middle_name": "Marie",
    "picture": "https://example.edu/jane.jpg",
    "email": "jane@example.edu"
  }
}
```

### MediaLocation

- **Type:**`object`

# MediaLocation

Represents a location or temporal position within a media object

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'MediaLocation'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`currentTime`**

  `string`, format: `duration` — A time interval or duration that represents the current playback position measured from the beginning of an AudioObject or VideoObject. If a currentTime is specified the value MUST conform to the ISO 8601 duration format.

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "MediaLocation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "currentTime": "PT30M54S"
}
```

### AllMediaObjects

- **Type:**

**Example:**

### Membership

- **Type:**`object`

# Membership

Represents a person's membership in an organization including role and status information

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`member` (required)**

  `string | object` — The person who is a member of the organization

- **`organization` (required)**

  `string | object` — The organization that the person is a member of

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Membership'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`roles`**

  `array` — The roles assigned to the member. Must be one or more valid LIS role values

  **Items:**

  `string`

- **`status`**

  `string`, possible values: `"Active", "Inactive"` — The current status of the membership

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Membership",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "member": "https://example.edu/users/554433",
  "organization": "https://example.edu/organizations/1234",
  "roles": [
    "Learner",
    "Instructor"
  ],
  "status": "Active"
}
```

### Message

- **Type:**`object`

# Message

Represents a message in a forum, thread, or other communication context

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Message'

- **`attachments`**

  `array` — An array of DigitalResource entities that are attachments to the message

  **Items:**

  `[ "string", "object" ]`

- **`body`**

  `string` — A string value comprising a plain-text rendering of the body content of the Message.

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`replyTo`**

  `string | object`

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Message",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "body": "This is the content of the message",
  "attachments": [
    "https://example.edu/resources/1",
    "https://example.edu/resources/2"
  ],
  "replyTo": ""
}
```

### MultipleChoiceResponse

- **Type:**`object`

A response to a multiple choice question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`value`**

  `string` — A string value that represents the selected option.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "MultipleChoiceResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "value": "The answer is 42"
}
```

### MultipleResponseResponse

- **Type:**`object`

A response to a multiple response question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`values`**

  `array` — The values selected in response to the question.

  **Items:**

  `string`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "MultipleResponseResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "values": [
    "The answer is 42"
  ]
}
```

### MultiSelectResponse

- **Type:**`object`

A response to a multi select question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`selections`**

  `array` — An array of the values representing the rater's selected responses.

  **Items:**

  `string`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "MultiSelectResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "selections": [
    "The answer is 42"
  ]
}
```

### MultiselectScale

- **Type:**`object`

# MultiselectScale

A scale that allows multiple selections from a list.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isOrderedSelection`**

  `boolean` — Indicates whether the order of the selected items is important.

- **`itemLabels`**

  `array` — The ordered list of labels for each point on the scale

  **Items:**

  `string`

- **`itemValues`**

  `array` — The ordered list of values for each point on the scale

  **Items:**

  `string`

- **`maxSelections`**

  `integer` — The maximum number of selections allowed.

- **`minSelections`**

  `integer` — The minimum number of selections required.

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`scalePoints`**

  `integer` — The number of points on the scale

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/scale/3",
  "type": "MultiselectScale",
  "scalePoints": 5,
  "itemLabels": [
    "😁",
    "😃",
    "😐",
    "😕",
    "😟"
  ],
  "itemValues": [
    "superhappy",
    "happy",
    "indifferent",
    "unhappy",
    "disappointed"
  ],
  "isOrderedSelection": false,
  "minSelections": 1,
  "maxSelections": 5,
  "dateCreated": "2018-08-01T06:00:00.000Z"
}
```

### NumericScale

- **Type:**`object`

# NumericScale

A scale that allows numeric input

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`maxLabel`**

  `string` — The label for the maximum value of the scale

- **`maxValue`**

  `number` — The maximum value of the scale

- **`minLabel`**

  `string` — The label for the minimum value of the scale

- **`minValue`**

  `number` — The minimum value of the scale

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`step`**

  `number` — Indicates the decimal step used for determining the options between the minimum and maximum values.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/scale/4",
  "type": "NumericScale",
  "minValue": 0,
  "minLabel": "Disliked",
  "maxValue": 10,
  "maxLabel": "Liked",
  "step": 0.5,
  "dateCreated": "2018-08-01T06:00:00.000Z"
}
```

### OpenEndedResponse

- **Type:**`object`

A response to an open ended question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`value`**

  `string` — the textual value of the response.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "OpenEndedResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "value": "The answer is 42"
}
```

### Organization

- **Type:**`object`

# Organization

Represents a formal or informal organization that hosts, manages or provides learning experiences

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this organization. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this agent. Must be set to 'Organization'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`members`**

  `array` — The members of this Organization

  **Items:**

  `[ "string", "object" ]`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`subOrganizationOf`**

  `string | object` — The parent Organization of this Organization

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/organization/554433",
  "type": "Organization",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "subOrganizationOf": "https://example.edu/organizations/schools/law",
  "members": [
    "https://example.edu/users/554433"
  ]
}
```

### Page

- **Type:**`object`

# Page

Represents a page in a document or website

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Page'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Page",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0"
}
```

### Person

- **Type:**`object`

# Person

Represents a person who can interact with or be the subject of learning activities

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`extensions` (required)**

  `object`

  - **`email` (required)**

    `string`, format: `email`

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this agent. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this agent. Must be set to 'Person'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/agent/554433",
  "type": "Person",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "email": "",
    "propertyName*": "anything"
  },
  "otherIdentifiers": [
    ""
  ]
}
```

### Question

- **Type:**

**Example:**

### Questionnaire

- **Type:**`object`

# Questionnaire

A Caliper Questionnaire is a collection of QuestionnaireItems.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Questionnaire'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`items`**

  `array` — The items of the questionnaire

  **Items:**

  - **`id` (required)**

    `string`, format: `uri`

  - **`type` (required)**

    `string`

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Questionnaire",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "items": [
    {
      "id": "https://example.edu/surveys/100/questionnaires/30/items/1",
      "type": "QuestionnaireItem"
    }
  ]
}
```

### QuestionnaireItem

- **Type:**`object`

# QuestionnaireItem

Represents an item in a questionnaire or survey

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'QuestionnaireItem'

- **`categories`**

  `array` — The categories of the question

  **Items:**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`question`**

  `string | object` — The Question entity posed by the QuestionnaireItem.

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

- **`weight`**

  `number` — The weight of the question

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "QuestionnaireItem",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "question": "https://example.edu/questions/1",
  "weight": 1,
  "categories": [
    "Math",
    "Science"
  ]
}
```

### Rating

- **Type:**`object`

# Rating

Represents a rating on an entity

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Rating'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`question`**

  `string | object` — The question that was rated

- **`rated`**

  `string | object` — The entity that was rated

- **`rater`**

  `string | object` — The person who provided the rating

- **`ratingComment`**

  `string | object` — The Comment left with the Rating

- **`selections`**

  `array` — The selections that were made

  **Items:**

  `string`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Rating",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "rater": "https://example.edu/users/554433",
  "rated": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf",
  "question": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf",
  "selections": [
    "Option 1",
    "Option 2"
  ],
  "ratingComment": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf"
}
```

### RatingScaleResponse

- **Type:**`object`

A response to a rating scale question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`selections`**

  `array` — An array of the values representing the rater's selected responses.

  **Items:**

  `string`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "RatingScaleResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "selections": [
    "Satisfied"
  ]
}
```

### Result

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

* **`type` (required)**

  `string`

* **`attempt`**

  `string | object` — The associated Attempt that was scored.

* **`comment`**

  `string` — A string value comprising a plain-text rendering of the comment.

* **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

* **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

* **`description`**

  `string` — A brief, written representation of the entity

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`maxResultScore`**

  `number` — A number that designates the maximum score permitted.

* **`name`**

  `string` — A word or phrase by which the entity is known

* **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

* **`resultScore`**

  `number` — A number that designates the actual score awarded.

* **`scoredBy`**

  `string | object` — The Agent who scored or graded the Attempt.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Result",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": {
    "id": "https://example.edu/terms/201601/courses/7/sections/1/assess/1/users/554433/attempts/1",
    "type": "Attempt"
  },
  "maxResultScore": 10,
  "resultScore": 10,
  "scoredBy": {
    "id": "https://example.edu/autograder",
    "type": "SoftwareApplication"
  },
  "comment": "This is the comment"
}
```

### Score

- **Type:**`object`

# Score

A Caliper Score represents a "raw" or unadjusted numeric score or grade awarded for a given assignment submission. A grade book SHOULD treat the scoreGiven value as read-only and preserve it.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`attempt` (required)**

  `string | object` — The associated Attempt that was scored.

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`scoredBy` (required)**

  `string | object` — The Agent who scored or graded the Attempt.

- **`type` (required)**

  `string` — The type of entity, must be Score

- **`comment`**

  `string` — A comment about the score

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`maxScore`**

  `number` — A number that designates the maximum score permitted.

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`scoreGiven`**

  `number` — A number that designates the actual score awarded.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/terms/201601/courses/7/sections/1/assess/1/users/554433/attempts/1/scores/1",
  "type": "Score",
  "attempt": {
    "id": "https://example.edu/terms/201601/courses/7/sections/1/assess/1/users/554433/attempts/1",
    "type": "Attempt",
    "assignee": "https://example.edu/users/554433",
    "assignable": "https://example.edu/terms/201601/courses/7/sections/1/assess/1",
    "count": 1,
    "dateCreated": "2016-11-15T10:05:00.000Z",
    "startedAtTime": "2016-11-15T10:05:00.000Z",
    "endedAtTime": "2016-11-15T10:55:30.000Z",
    "duration": "PT50M30S"
  },
  "maxScore": 15,
  "scoreGiven": 10,
  "scoredBy": {
    "id": "https://example.edu/autograder",
    "type": "SoftwareApplication",
    "dateCreated": "2016-11-15T10:55:58.000Z"
  },
  "comment": "auto-graded exam",
  "dateCreated": "2016-11-15T10:56:00.000Z"
}
```

### SearchResponse

- **Type:**`object`

A Caliper SearchResponse is a generic type that represents the search results for a given query.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`searchProvider` (required)**

  `string | object`

- **`searchTarget` (required)**

  `string | object`

- **`type` (required)**

  `string`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`query`**

  `string | object` — The query that was used to search for the target

- **`searchResultsItemCount`**

  `integer` — The number of search results

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "SearchResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "searchProvider": "",
  "searchTarget": "",
  "query": "What is the capital of France?",
  "searchResultsItemCount": 10
}
```

### SelectTextResponse

- **Type:**`object`

A response to a select text question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`values`**

  `array` — An ordered collection of one or more selected options.

  **Items:**

  `string`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "SelectTextResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "values": [
    "Information Model",
    "Sensor API",
    "Profiles"
  ]
}
```

### Session

- **Type:**`object`

Represents a user session established by a Person using a client application

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Session'

- **`client`**

  `string | object` — The client application used to initiate the session

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `integer` — Duration of the session in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — ISO 8601 datetime when the session ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — ISO 8601 datetime when the session started

- **`user`**

  `string | object` — The user who initiated the session

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Session",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "user": "https://example.edu/users/554433",
  "startedAtTime": "2023-08-15T14:12:00.000Z",
  "endedAtTime": "2023-08-15T15:12:00.000Z",
  "duration": 3600,
  "client": "https://example.edu/software/1234"
}
```

### SharedAnnotation

- **Type:**`object`

# SharedAnnotation

A SharedAnnotation represents the act of sharing a reference to a DigitalResource with other agents.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`annotated` (required)**

  `string | object`

- **`annotator` (required)**

  `string | object` — The person that made the annotation

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'SharedAnnotation'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`withAgents`**

  `array` — The agents this resource was shared with

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "SharedAnnotation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "annotator": "https://example.edu/users/554433",
  "annotated": "",
  "withAgents": [
    "https://example.edu/users/554433"
  ]
}
```

### SoftwareApplication

- **Type:**`object`

# SoftwareApplication

Represents a software application that can act as an agent

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri`

- **`type` (required)**

  `string` — The type of this agent. Must be set to 'SoftwareApplication'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`host`**

  `string` — The host of the application

- **`ipAddress`**

  `string` — The IP address of the application

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`userAgent`**

  `string` — The user agent of the application

- **`version`**

  `string` — The version of the application

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "",
  "type": "SoftwareApplication",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "version": "v1.0.0",
  "host": "example.edu",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

### Survey

- **Type:**`object`

# Survey

A Caliper Survey represents a research method for collecting data from a targeted group of respondents. The Survey provides a standardized process for gathering data that utilizes one or more Questionnaire entities.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Survey'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`items`**

  `array` — The items of the survey

  **Items:**

  `[ "string", "object" ]`

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Survey",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "items": [
    {
      "id": "https://example.edu/surveys/100/questionnaires/30",
      "type": "Questionnaire",
      "items": [
        {
          "id": "https://example.edu/surveys/100/questionnaires/30/items/1",
          "type": "QuestionnaireItem"
        },
        {
          "id": "https://example.edu/surveys/100/questionnaires/30/items/2",
          "type": "QuestionnaireItem"
        }
      ],
      "dateCreated": "2018-08-01T06:00:00.000Z"
    }
  ]
}
```

### SurveyInvitation

- **Type:**`object`

# SurveyInvitation

A Caliper SurveyInvitation represents a survey invitation sent to raters.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'SurveyInvitation'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`dateSent`**

  `string`, format: `date-time` — The date and time the invitation was sent to the rater.

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`rater`**

  `string | object` — The Person which will rate the Survey.

- **`sentCount`**

  `number` — An integer value used to determine the amount of times the invitation was sent to the rater.

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`survey`**

  `string | object` — The Survey that the SurveyInvitation is for.

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "SurveyInvitation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "rater": "https://example.edu/users/554433",
  "survey": "",
  "sentCount": 1,
  "dateSent": "2021-01-01T00:00:00.000Z"
}
```

### SystemIdentifier

- **Type:**`object`

A SystemIdentifier is a unique identifier for an entity

- **`identifier` (required)**

  `string` — The identifier for the entity

- **`identifierType` (required)**

  `string`, possible values: `"AccountUserName", "EmailAddress", "LisSourcedId", "LtiContextId", "LtiDeploymentId", "LtiPlatformId", "LtiToolId", "LtiUserId", "OneRosterSourcedId", "Other", "SisSourcedId", "SystemId"`

- **`type` (required)**

  `string`

- **`extensions`**

  `object` — A map of additional attributes not defined by the model MAY be specified for a more concise representation of the SystemIdentifier.

- **`source`**

  `string | object` — The source of the identifier

**Example:**

```
{
  "type": "SystemIdentifier",
  "identifierType": "AccountUserName",
  "identifier": "1234567890"
}
```

### TagAnnotation

- **Type:**`object`

# TagAnnotation

A TagAnnotation represents the act of tagging a DigitalResource with tags or labels.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`annotated` (required)**

  `string | object`

- **`annotator` (required)**

  `string | object` — The person that made the annotation

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'TagAnnotation'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`tags`**

  `array` — The tags applied to the resource

  **Items:**

  `string`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "TagAnnotation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "annotator": "https://example.edu/users/554433",
  "annotated": "",
  "tags": [
    "important",
    "review",
    "exam"
  ]
}
```

### TextPositionSelector

- **Type:**`object`

# TextPositionSelector

Represents a selection of text from a digital resource

- **`end` (required)**

  `number`

- **`start` (required)**

  `number`

- **`type` (required)**

  `string`

**Example:**

```
{
  "type": "TextPositionSelector",
  "start": 1,
  "end": 1
}
```

### Thread

- **Type:**`object`

# Thread

A thread is a digital resource that allows users to discuss and share ideas.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`items`**

  `array` — An ordered collection of Message entities.

  **Items:**

  `[ "string", "object" ]`

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Thread",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "items": [
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1/messages/1",
      "type": "Message"
    },
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1/messages/2",
      "type": "Message",
      "replyTo": {
        "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1/messages/1",
        "type": "Message"
      }
    },
    {
      "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1/messages/3",
      "type": "Message",
      "replyTo": {
        "id": "https://example.edu/terms/201601/courses/7/sections/1/forums/1/topics/1/messages/2",
        "type": "Message"
      }
    }
  ]
}
```

### TimebackActivityContext

- **Type:**`object`

# TimebackActivityContext

Represents the context of the activity where the event was recorded.

This context represents a unified interface for third parties users of the timeback platform apis to send student metrics.

These metrics can be processed in an ETL layer to create a unified view of student metrics in different applications.

- **`app` (required)**

  `object` — The application where the event was recorded

  - **`name` (required)**

    `string`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`id`**

    `string`, format: `uri`

- **`id` (required)**

  `string`, format: `uri`

- **`subject` (required)**

  `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math", "None"`

- **`type` (required)**

  `string`

- **`activity`**

  `object` — The activity where the event was recorded

  - **`name` (required)**

    `string`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`id`**

    `string`, format: `uri`

- **`course`**

  `object` — The course where the event was recorded

  - **`name` (required)**

    `string`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`id`**

    `string`, format: `uri`

- **`process`**

  `boolean`

**Example:**

```
{
  "id": "",
  "type": "TimebackActivityContext",
  "subject": "Reading",
  "app": {
    "id": "https://your.app.url",
    "name": "Example App"
  },
  "course": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<courseSourcedId>",
    "name": "Example Course"
  },
  "activity": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/components/<componentSourcedId>",
    "name": "Example Activity"
  },
  "process": true
}
```

### TimebackActivityMetricsCollection

- **Type:**`object`

# TimebackActivityMetricsCollection

Represents a collection of activity metrics.

The collection is used to store the metrics for a student's activity.

Supported metrics: xpEarned, totalQuestions, correctQuestions, masteredUnits

You can send an event with multiple metrics at once.

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for the collection

- **`items` (required)**

  `array`

  **Items:**

  - **`type` (required)**

    `string`, possible values: `"xpEarned", "totalQuestions", "correctQuestions", "masteredUnits"`

  - **`value` (required)**

    `number`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

- **`type` (required)**

  `string` — The type of the collection

- **`extensions`**

  `object` — Additional attributes not defined by the model

**Example:**

```
{
  "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/collections/1",
  "type": "TimebackActivityMetricsCollection",
  "items": [
    {
      "type": "xpEarned",
      "value": 1,
      "extensions": {
        "customField": "customValue"
      }
    }
  ],
  "extensions": {
    "customField": "customValue"
  }
}
```

### TimebackTimeSpentMetricsCollection

- **Type:**`object`

# TimebackTimeSpentMetricsCollection

Represents a collection of time spent metrics.

Supported types: active, inactive, waste, unknown, anti-pattern

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for the collection

- **`items` (required)**

  `array`

  **Items:**

  - **`type` (required)**

    `string`, possible values: `"active", "inactive", "waste", "unknown", "anti-pattern"`

  - **`value` (required)**

    `number`

  - **`endDate`**

    `string`, format: `date-time`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`startDate`**

    `string`, format: `date-time`

  - **`subType`**

    `string`

- **`type` (required)**

  `string`

- **`extensions`**

  `object` — Additional attributes not defined by the model

**Example:**

```
{
  "id": "https://your-api-endpoint/collections/1",
  "type": "TimebackTimeSpentMetricsCollection",
  "items": [
    {
      "type": "active",
      "subType": "",
      "value": 1,
      "startDate": "",
      "endDate": "",
      "extensions": {
        "customField": "customValue"
      }
    }
  ],
  "extensions": {
    "customField": "customValue"
  }
}
```

### TimebackUser

- **Type:**`object`

# TimebackUser

Represents a user in the context of the Timeback application.

If possible, always send the user id as the oneroster url to get the user information.

If the oneroster url is not available, send the user id as a url with your application base url.

Example: <https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/123>

- **`email` (required)**

  `string`, format: `email`

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for the actor

- **`type` (required)**

  `string` — The type of this user. Must be set to 'TimebackUser'

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string`

- **`role`**

  `string`, possible values: `"student", "teacher", "admin", "guide"`

**Example:**

```
{
  "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>",
  "type": "TimebackUser",
  "email": "",
  "name": "",
  "role": "student",
  "extensions": {
    "customField": "customValue"
  }
}
```

### TrueFalseResponse

- **Type:**`object`

A response to a true false question

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

- **`value`**

  `string`, possible values: `"true", "false", "yes", "no"` — The boolean value of the response.

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "TrueFalseResponse",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S",
  "value": "true"
}
```

### VideoObject

- **Type:**`object`

# VideoObject

Represents a video object

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — An optional time interval that represents the total time required to view and/or listen to the MediaObject at normal speed. If a duration is specified the value MUST conform to the ISO 8601 duration format.

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "VideoObject",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "duration": "PT1H17M50S"
}
```

### WebPage

- **Type:**`object`

# WebPage

Represents a web page

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'WebPage'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "WebPage",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0"
}
```

### ToolUseEvent

- **Type:**`object`

A tool use event

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Used"` — The action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the tool use action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The SoftwareApplication that constitutes the object of the interaction, represented either as a URL string or an object

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ToolUseEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — The aggregate measure that was generated as a result of the action

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ToolUseEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Used",
  "object": "https://example.edu/terms/201801/courses/7/resources/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ToolUseProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/measures/001",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AnnotationEvent

- **Type:**`object`

Represents an event where a user creates or modifies an annotation

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Bookmarked", "Highlighted", "Shared", "Tagged"` — The annotation action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the annotation action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`generated` (required)**

  `string | object` — The annotation that was generated as a result of the action

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The digital resource that was annotated

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'AnnotationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "AnnotationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Highlighted",
  "object": "https://example.edu/terms/201801/courses/7/resources/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AnnotationProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/annotations/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AssessmentEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Started", "Paused", "Resumed", "Restarted", "Submitted"` — The assessment action that was performed

* **`actor` (required)**

  `string | object` — The person that performed the assessment action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`generated` (required)**

  `string | object` — The attempt that was generated as a result of the action

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The assessment that was acted upon

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to 'AssessmentEvent'

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "AssessmentEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/assessments/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AssessmentProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/attempts/123",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AssessmentItemEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Started", "Skipped", "Completed"` — The assessment item action that was performed

* **`actor` (required)**

  `string | object` — The person that performed the assessment action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The assessment item that was acted upon

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string`

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — The generated object depends on the action: Attempt for 'Started' or 'Skipped', Response for 'Completed'

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "AssessmentItemEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/assessment-items/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AssessmentProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/responses/123",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### MediaEvent

- **Type:**`object`

Represents an event where a user interacts with media content such as audio, video, or images

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Started", "Ended", "Paused", "Resumed", "Restarted", "ForwardedTo", "JumpedTo", "ChangedResolution", "ChangedSize", "ChangedSpeed", "ChangedVolume", "EnabledClosedCaptioning", "DisabledClosedCaptioning", "EnteredFullScreen", "ExitedFullScreen", "Muted", "Unmuted", "OpenedPopout", "ClosedPopout"` — The media action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the media action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The media object that was interacted with

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'MediaEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — The location within the media object that was the target of the action

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "MediaEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/media/video1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "MediaProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/media/video1/locations/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### MediaNavigationEvent

- **Type:**`object`

Represents a navigation event within media content

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"NavigatedTo"` — The navigation action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the navigation action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The media object that was navigated to

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`target` (required)**

  `string | object` — The location within the media object that was navigated to

- **`type` (required)**

  `string` — The type of this event. Must be set to 'NavigationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "NavigationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "NavigatedTo",
  "object": "https://example.edu/media/video1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "MediaProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/media/video1/locations/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### MediaViewEvent

- **Type:**`object`

Represents a view event of media content

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Viewed"` — The view action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the view action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The media object that was viewed

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ViewEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — The optional location within the media object that was viewed

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/media/video1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "MediaProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/media/video1/locations/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AssignableEvent

- **Type:**`object`

Represents an event where a user interacts with an assignable digital resource

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Activated", "Deactivated", "Started", "Completed", "Submitted", "Reviewed"` — Actions available in the Assignable Profile

- **`actor` (required)**

  `string | object` — The person that performed the assignable action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The assignable digital resource that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'AssignableEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — The attempt that was generated as a result of the action (only for Started, Completed, Submitted, and Reviewed actions)

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "AssignableEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/assignments/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AssignableProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/attempts/123",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AssignableNavigationEvent

- **Type:**`object`

Represents a navigation event within an assignable digital resource

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"NavigatedTo"` — Navigation actions used in the Assignable Profile

- **`actor` (required)**

  `string | object` — The person that performed the assignable action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The assignable digital resource that was navigated to

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'NavigationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "NavigationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "NavigatedTo",
  "object": "https://example.edu/assignments/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AssignableProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### AssignableViewEvent

- **Type:**`object`

Represents a view event of an assignable digital resource

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Viewed"` — View actions used in the Assignable Profile

- **`actor` (required)**

  `string | object` — The person that performed the assignable action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The assignable digital resource that was viewed

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ViewEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/assignments/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "AssignableProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### FeedbackEvent

- **Type:**

**Example:**

### ForumEvent

- **Type:**`object`

Represents an event related to forum subscription

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Subscribed", "Unsubscribed"` — The forum action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The forum that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ForumEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ForumEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Subscribed",
  "object": "https://example.edu/forums/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ForumProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ThreadEvent

- **Type:**`object`

Represents an event related to thread interaction

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"MarkedAsRead", "MarkedAsUnRead"` — The thread action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The thread that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ThreadEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ThreadEvent",
  "actor": "https://example.edu/users/554433",
  "action": "MarkedAsRead",
  "object": "https://example.edu/forums/1/threads/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ForumProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### MessageEvent

- **Type:**`object`

Represents an event related to message interaction

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"MarkedAsRead", "MarkedAsUnRead", "Posted"` — The message action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The message that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'MessageEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "MessageEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Posted",
  "object": "https://example.edu/forums/1/messages/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ForumProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ForumNavigationEvent

- **Type:**`object`

Represents a navigation event within a forum

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"NavigatedTo"` — The navigation action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The forum, thread, or message that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'NavigationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "NavigationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "NavigatedTo",
  "object": "https://example.edu/forums/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ForumProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ForumViewEvent

- **Type:**`object`

Represents a view event of forum content

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Viewed"` — The view action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The forum, thread, or message that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ViewEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/forums/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ForumProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### GradeEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Graded"` — Actions available in the Grading Profile

* **`actor` (required)**

  `string | object` — The agent (person or software application) that performed the grading action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`generated` (required)**

  `string | object` — The score that was generated as a result of the grading action

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The attempt that was graded

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to 'GradeEvent'

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "GradeEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Graded",
  "object": "https://example.edu/attempts/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "GradingProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/scores/123",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ViewEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Viewed"` — View actions used in the Grading Profile

* **`actor` (required)**

  `string | object` — The person that viewed the result

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The result that was viewed

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to 'ViewEvent'

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — Entity generated as a result of the interaction

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/results/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "GradingProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ReadingNavigationEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"NavigatedTo"` — Navigation actions used in the Reading Profile

* **`actor` (required)**

  `string | object` — The person that performed the reading action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The digital resource that was navigated to

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string`

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — Entity generated as a result of the interaction

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — The target digital resource that was navigated to

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "NavigationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "NavigatedTo",
  "object": "https://example.edu/reading/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ReadingProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/reading/123#target",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ReadingViewEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Viewed"` — View actions used in the Reading Profile

* **`actor` (required)**

  `string | object` — The person that performed the reading action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The digital resource that was viewed

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string`

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — Entity generated as a result of the interaction

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — The target digital resource that was viewed

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/reading/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ReadingProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/reading/123#target",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ResourceManagementEvent

- **Type:**`object`

Represents an event related to resource management activities

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Created", "Copied", "Modified", "Deleted", "Described", "Downloaded", "Uploaded", "Retrieved", "Printed", "Published", "Unpublished", "Archived", "Restored", "Saved"` — The resource management action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the resource management action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The digital resource that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ResourceManagementEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — The digital resource that was generated as a result of the action (only required for 'Copied' action)

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ResourceManagementEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Created",
  "object": "https://example.edu/resources/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ResourceManagementProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/resources/2",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SearchEvent

- **Type:**`object`

Represents an event related to searching a resource

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Searched"` — The search action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the search action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The digital resource or software application that was searched

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to ''SearchEvent

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — The search provider that describes the search criteria, count of search results returned, and the search results

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "SearchEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Searched",
  "object": "https://example.edu/resources/123",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SearchProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/resources/123456",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SessionEvent

- **Type:**

**Example:**

### SurveyInvitationEvent

- **Type:**`object`

Represents an event related to survey invitations

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Sent", "Accepted", "Declined"` — The survey invitation action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The survey invitation that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'SurveyInvitationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "SurveyInvitationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Sent",
  "object": "https://example.edu/surveys/1/invitations/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SurveyEvent

- **Type:**`object`

Represents an event related to survey participation

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"OptedIn", "OptedOut"` — The survey action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The survey that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'SurveyEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "SurveyEvent",
  "actor": "https://example.edu/users/554433",
  "action": "OptedIn",
  "object": "https://example.edu/surveys/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### QuestionnaireEvent

- **Type:**`object`

Represents an event related to questionnaire interaction

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Started", "Submitted"` — The questionnaire action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The questionnaire that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'QuestionnaireEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — The attempt that was generated by this event

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "QuestionnaireEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/surveys/1/questionnaire",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/surveys/1/attempts/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### QuestionnaireItemEvent

- **Type:**`object`

Represents an event related to questionnaire item interaction

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Started", "Skipped", "Completed"` — The questionnaire item action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`generated` (required)**

  `string | object` — The attempt or response that was generated by this event

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The questionnaire item that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'QuestionnaireItemEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "QuestionnaireItemEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Started",
  "object": "https://example.edu/surveys/1/items/1",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/surveys/1/attempts/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SurveyNavigationEvent

- **Type:**`object`

Represents a navigation event within a survey

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"NavigatedTo"` — The navigation action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The questionnaire or item that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'NavigationEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "NavigationEvent",
  "actor": "https://example.edu/users/554433",
  "action": "NavigatedTo",
  "object": "https://example.edu/surveys/1/questionnaire",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SurveyViewEvent

- **Type:**`object`

Represents a view event of survey content

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"Viewed"` — The view action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the action

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The questionnaire or item that was acted upon

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to 'ViewEvent'

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ViewEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Viewed",
  "object": "https://example.edu/surveys/1/questionnaire",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SurveyProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### ToolLaunchEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`, possible values: `"Launched", "Returned"` — The tool launch action that was performed

* **`actor` (required)**

  `string | object` — The person that performed the tool launch action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The software application that was launched or returned from

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to 'ToolLaunchEvent'

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — The digital resource that was generated as a result of the action

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — The target link that was used for the tool launch

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ToolLaunchEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Launched",
  "object": "https://example.edu/tools/calculator",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "ToolLaunchProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/resources/123",
  "target": "https://example.edu/lti/links/123",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### TimebackActivityEvent

- **Type:**

# TimebackActivityEvent

Represents an activity event in the context of the Timeback application.

This event is used to track the completion of an activity.

The object of this event is the activity context where the event was recorded.

The actor of this event is the timeback user who completed the activity.

The event requires a generated metrics attribute to work.

For now we only support "**Completed**" as an action. In the future we may support other actions.

**Example:**

### TimebackTimeSpentEvent

- **Type:**`object`

# TimebackTimeSpentEvent

Represents a student time spent activity in the context of an app using the timeback platform.

This event is used to track the time spent and the quality of the time spent by a student on an activity.

The object of this event is the activity context where the event was recorded.

The actor of this event is the timeback user who spent time on the activity.

The event requires a generated metrics attribute to work.

The metrics can indicate a parent type of metric: 'active' | 'inactive' | 'waste'

A subType is also included for more specific representation of the activity recorded.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`

- **`actor` (required)**

  `object` — # TimebackUser Represents a user in the context of the Timeback application. If possible, always send the user id as the oneroster url to get the user information. If the oneroster url is not available, send the user id as a url with your application base url. Example: https\://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/123

  - **`email` (required)**

    `string`, format: `email`

  - **`id` (required)**

    `string`, format: `uri` — The unique identifier for the actor

  - **`type` (required)**

    `string` — The type of this user. Must be set to 'TimebackUser'

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`name`**

    `string`

  - **`role`**

    `string`, possible values: `"student", "teacher", "admin", "guide"`

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`generated` (required)**

  `object` — # TimebackTimeSpentMetricsCollection Represents a collection of time spent metrics. Supported types: active, inactive, waste, unknown, anti-pattern

  - **`id` (required)**

    `string`, format: `uri` — The unique identifier for the collection

  - **`items` (required)**

    `array`

    **Items:**

    - **`type` (required)**

      `string`, possible values: `"active", "inactive", "waste", "unknown", "anti-pattern"`

    - **`value` (required)**

      `number`

    - **`endDate`**

      `string`, format: `date-time`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`startDate`**

      `string`, format: `date-time`

    - **`subType`**

      `string`

  - **`type` (required)**

    `string`

  - **`extensions`**

    `object` — Additional attributes not defined by the model

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `object` — # TimebackActivityContext Represents the context of the activity where the event was recorded. This context represents a unified interface for third parties users of the timeback platform apis to send student metrics. These metrics can be processed in an ETL layer to create a unified view of student metrics in different applications.

  - **`app` (required)**

    `object` — The application where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`id` (required)**

    `string`, format: `uri`

  - **`subject` (required)**

    `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math", "None"`

  - **`type` (required)**

    `string`

  - **`activity`**

    `object` — The activity where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`course`**

    `object` — The course where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`process`**

    `boolean`

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string`

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — Entity that represents the referring context

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "TimeSpentEvent",
  "actor": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>",
    "type": "TimebackUser",
    "email": "",
    "name": "",
    "role": "student",
    "extensions": {
      "customField": "customValue"
    }
  },
  "action": "SpentTime",
  "object": {
    "id": "",
    "type": "TimebackActivityContext",
    "subject": "Reading",
    "app": {
      "id": "https://your.app.url",
      "name": "Example App"
    },
    "course": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<courseSourcedId>",
      "name": "Example Course"
    },
    "activity": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/components/<componentSourcedId>",
      "name": "Example Activity"
    },
    "process": true
  },
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "TimebackProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": {
    "id": "https://your-api-endpoint/collections/1",
    "type": "TimebackTimeSpentMetricsCollection",
    "items": [
      {
        "type": "active",
        "subType": "",
        "value": 1,
        "startDate": "",
        "endDate": "",
        "extensions": {
          "customField": "customValue"
        }
      }
    ],
    "extensions": {
      "customField": "customValue"
    }
  },
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### Entity

- **Type:**`object`

# Entity

Represents a generic Caliper Entity that participates in learning-related activities. Can be provided in an envelope for context.

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must match the term specified in the Caliper information model

- **`@context`**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Entity",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ]
}
```

### Agent

- **Type:**`object`

# Agent

Represents a generic Agent capable of initiating or performing actions. Use a more specific agent type when possible.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri`

- **`type` (required)**

  `string` — The type of this agent. Must be set to 'Agent'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "",
  "type": "Agent",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ]
}
```

### Annotation

- **Type:**`object`

# Annotation

Generic annotation type, represents annotations made on digital resources. Use this type if no other annotation type is more specific.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`annotated` (required)**

  `string | object`

- **`annotator` (required)**

  `string | object` — The person that made the annotation

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'Annotation'

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Annotation",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "annotator": "https://example.edu/users/554433",
  "annotated": ""
}
```

### DigitalResource

- **Type:**`object`

# DigitalResource

Represents a digital resource such as a file, image, or video, survey, thread and other resources.

See the [specification](https://www.imsglobal.org/spec/caliper/v1p2#digitalresource) for a list of all digital resources.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'DigitalResource'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "DigitalResource",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0"
}
```

### AssignableDigitalResource

- **Type:**`object`

# AssignableDigitalResource

Represents a digital resource that can be assigned to learners with associated dates and scoring information

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'AssignableDigitalResource'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`dateToActivate`**

  `string`, format: `date-time` — The datetime when this was activated

- **`dateToShow`**

  `string`, format: `date-time` — describes when the resource should be shown or made available to learners

- **`dateToStartOn`**

  `string`, format: `date-time` — The datetime when this resource becomes available to learners

- **`dateToSubmit`**

  `string`, format: `date-time` — The datetime when this resource is due

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`maxAttempts`**

  `number` — A non-negative integer that designates the number of permitted attempts.

- **`maxScore`**

  `number` — The maximum possible score for this assignable resource

- **`maxSubmits`**

  `number` — A non-negative integer that designates the number of permitted submissions.

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "AssignableDigitalResource",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "dateToActivate": "2023-08-15T14:00:00.000Z",
  "dateToShow": "2023-08-15T14:00:00.000Z",
  "dateToStartOn": "2023-08-15T14:00:00.000Z",
  "dateToSubmit": "2023-08-22T23:59:59.000Z",
  "maxAttempts": 3,
  "maxSubmits": 3,
  "maxScore": 100
}
```

### MediaObject

- **Type:**`object`

# MediaObject

Represents a media object such as an audio or video file

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of this entity. Must be set to 'MediaObject'

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — An optional time interval that represents the total time required to view and/or listen to the MediaObject at normal speed. If a duration is specified the value MUST conform to the ISO 8601 duration format.

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "MediaObject",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "duration": "PT1H17M50S"
}
```

### DatetimeQuestion

- **Type:**`object`

# DatetimeQuestion

A Caliper DateTimeQuestion represents a closed-end question type with the response provided in a date and time format.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`maxDateTime`**

  `string`, format: `date-time` — The maximum date and time that can be selected

- **`maxLabel`**

  `string` — The label for the maximum date and time

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`minDateTime`**

  `string`, format: `date-time` — The minimum date and time that can be selected

- **`minLabel`**

  `string` — The label for the minimum date and time

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`questionPosed`**

  `string` — A question that has been posed to a user

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "DatetimeQuestion",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "storageName": "lecture-01.pdf",
  "creators": [
    "https://example.edu/users/223344"
  ],
  "mediaType": "application/pdf",
  "keywords": [
    "lecture",
    "introduction"
  ],
  "learningObjectives": [
    "https://example.edu/objectives/1234"
  ],
  "isPartOf": "https://example.edu/courses/biology/101/resources",
  "datePublished": "2023-08-15T14:12:00.000Z",
  "version": "1.0.0",
  "questionPosed": "What is the capital of France?",
  "minDateTime": "2021-01-01T00:00:00Z",
  "minLabel": "Min",
  "maxDateTime": "2021-01-01T00:00:00Z",
  "maxLabel": "Max"
}
```

### OpenEndedQuestion

- **Type:**`object`

# OpenEndedQuestion

A Caliper OpenEndedQuestion represents a question with no pre-defined response. Respondents can record their response in the form of qualitative feedback with no length limit imposed.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of question, must be OpenEndedQuestion

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`questionPosed`**

  `string` — A question that has been posed to a user

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/surveys/100/questionnaires/30/items/2/question",
  "type": "OpenEndedQuestion",
  "questionPosed": "What would you change about your course?"
}
```

### MultiSelectQuestion

- **Type:**`object`

# MultiSelectQuestion

A Caliper MultiSelectQuestion represents a closed-end question type with the response provided in a multiple-choice format.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of question, must be MultiselectQuestion

- **`creators`**

  `array` — An ordered collection of Agent entities responsible for bringing resource into being

  **Items:**

  `[ "string", "object" ]`

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`datePublished`**

  `string`, format: `date-time` — The date and time at which the resource was published

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`isPartOf`**

  `string | object` — The parent resource of which this resource is a part

- **`itemLabels`**

  `array` — An array of strings that represent the labels for the items in the MultiselectQuestion.

  **Items:**

  `string`

- **`itemValues`**

  `array` — An array of strings that represent the values for the items in the MultiselectQuestion.

  **Items:**

  `string`

- **`keywords`**

  `array` — An array of keywords or tags used to define or categorize the resource

  **Items:**

  `string`

- **`learningObjectives`**

  `array` — An array of learning objectives associated with this resource. See \[@LearningObjective]\(#model/learningobjective)

  **Items:**

  `[ "string", "object" ]`

- **`mediaType`**

  `string` — The media type of the resource from IANA approved media types

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`points`**

  `number` — A integer value used to determine the amount of points on the MultiselectQuestion.

- **`questionPosed`**

  `string` — A question that has been posed to a user

- **`storageName`**

  `string` — The name of resource when stored in a file system

- **`version`**

  `string` — A string value that designates the current form or version of the resource

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/surveys/100/questionnaires/30/items/4/question",
  "type": "MultiselectQuestion",
  "questionPosed": "What do you want to study today?",
  "points": 4,
  "itemLabels": [
    "Calculus",
    "Number theory",
    "Combinatorics",
    "Algebra"
  ],
  "itemValues": [
    "https://example.edu/terms/201801/courses/7/sections/1/objectives/1",
    "https://example.edu/terms/201801/courses/7/sections/1/objectives/2",
    "https://example.edu/terms/201801/courses/7/sections/1/objectives/3",
    "https://example.edu/terms/201801/courses/7/sections/1/objectives/4"
  ]
}
```

### Scale

- **Type:**`object`

# Scale

A Caliper Scale is a generic type that represents a scale employed in order to capture some rating. Utilize Scale only if no suitable subtype exists to represent the scale being described.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string` — The type of entity, must be Scale

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/scale/1",
  "type": "Scale",
  "dateCreated": "2018-08-01T06:00:00.000Z"
}
```

### Response

- **Type:**`object`

A Caliper Response is a generic type that represents the selected option generated by a Person interacting with a DigitalResource such as an AssessmentItem or QuestionnaireItem. Utilize Response only if no suitable subtype exists to represent the response being described.

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`id` (required)**

  `string`, format: `uri` — The unique identifier for this entity. Must be a valid IRI and should be dereferenceable

- **`type` (required)**

  `string`

- **`attempt`**

  `string | object` — The attempt that the response belongs to

- **`dateCreated`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was created

- **`dateModified`**

  `string`, format: `date-time` — ISO 8601 datetime when this entity was last modified

- **`description`**

  `string` — A brief, written representation of the entity

- **`duration`**

  `string`, format: `duration` — The duration of the attempt in seconds

- **`endedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was ended

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`name`**

  `string` — A word or phrase by which the entity is known

- **`otherIdentifiers`**

  `array`

  **Items:**

  `[ "string", "object" ]`

- **`startedAtTime`**

  `string`, format: `date-time` — The date and time the attempt was started

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "https://example.edu/entity/554433",
  "type": "Response",
  "name": "John Doe",
  "description": "A student at Example University",
  "dateCreated": "2023-08-15T14:12:00.000Z",
  "dateModified": "2023-08-15T14:12:00.000Z",
  "extensions": {
    "customField": "customValue"
  },
  "otherIdentifiers": [
    ""
  ],
  "attempt": "https://example.edu/attempts/1234",
  "startedAtTime": "2021-01-01T00:00:00Z",
  "endedAtTime": "2021-01-01T00:00:00Z",
  "duration": "PT50M30S"
}
```

### TimebackActivityMetric

- **Type:**`object`

# TimebackActivityMetric

Represents a metric for an activity.

Each metric represents a single metric for a student's activity.

Supported metrics: xpEarned, totalQuestions, correctQuestions, masteredUnits

- **`type` (required)**

  `string`, possible values: `"xpEarned", "totalQuestions", "correctQuestions", "masteredUnits"`

- **`value` (required)**

  `number`

- **`extensions`**

  `object` — Additional attributes not defined by the model

**Example:**

```
{
  "type": "xpEarned",
  "value": 1,
  "extensions": {
    "customField": "customValue"
  }
}
```

### TimeSpentMetric

- **Type:**`object`

# TimeSpentMetric

Represents a time spent metric in seconds.

Supported types: active, inactive, waste, unknown, anti-pattern

- **`type` (required)**

  `string`, possible values: `"active", "inactive", "waste", "unknown", "anti-pattern"`

- **`value` (required)**

  `number`

- **`endDate`**

  `string`, format: `date-time`

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`startDate`**

  `string`, format: `date-time`

- **`subType`**

  `string`

**Example:**

```
{
  "type": "active",
  "subType": "",
  "value": 1,
  "startDate": "",
  "endDate": "",
  "extensions": {
    "customField": "customValue"
  }
}
```

### GeneratedAnnotation

- **Type:**`[ "string", "object" ]`

The annotation that was generated as a result of the action

**Example:**

### FeedbackCommentEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string` — The type of this event. Must be set to 'Commented'

* **`actor` (required)**

  `string | object` — The person that performed the feeeback action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The Entity that is the target of the feedback

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to ''FeedbackEvent

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — The Comment entity that describes the feedback provided

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — If the object of the feedback is a particular segment of a DigitalResource use a Frame to mark its location

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "FeedbackEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Commented",
  "object": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "FeedbackProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/terms/201801/courses/7/sections/1/assess/1/items/6/users/665544/responses/1/comment/1",
  "target": "https://example.edu/etexts/201?index=2502",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### FeedbackRankEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string` — The type of this event. Must be set to 'Ranked'

* **`actor` (required)**

  `string | object` — The person that performed the feeeback action

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `string | object` — The Entity that is the target of the feedback

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string` — The type of this event. Must be set to ''FeedbackEvent

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`generated`**

  `string | object` — The Rating entity that describes the feedback provided

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — If the object of the feedback is a particular segment of a DigitalResource use a Frame to mark its location

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "FeedbackEvent",
  "actor": "https://example.edu/users/554433",
  "action": "Ranked",
  "object": "https://example.edu/terms/201801/courses/7/sections/1/resources/1/syllabus.pdf",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "FeedbackProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/terms/201801/courses/7/sections/1/assess/1/items/6/users/665544/responses/1/rating/1",
  "target": "https://example.edu/etexts/201?index=2502",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SessionLoggedInEvent

- **Type:**`object`

Represents an event related to session logging in and out

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"LoggedIn", "LoggedOut"` — The session action that was performed

- **`actor` (required)**

  `string | object` — The person that performed the session action for LoggedIn or LoggedOut actions

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The object of the session event

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to ''SessionEvent

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — The referrer of the session event

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — The target of the session event

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "SessionEvent",
  "actor": "https://example.edu/users/554433",
  "action": "LoggedIn",
  "object": "https://example.edu/software/123456",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SessionProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/resources/123456",
  "referrer": "https://example.edu/resources/123456",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### SessionTimedOutEvent

- **Type:**`object`

Represents an event related to session timed out

- **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

- **`action` (required)**

  `string`, possible values: `"TimedOut"` — The session action that was performed

- **`actor` (required)**

  `string | object` — The software that performed the session action for TimedOut actions

- **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

- **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

- **`object` (required)**

  `string | object` — The object of the session event

- **`profile` (required)**

  `string` — The profile that governs interpretation of this event

- **`type` (required)**

  `string` — The type of this event. Must be set to ''SessionEvent

- **`edApp`**

  `string | object` — The application context

- **`extensions`**

  `object` — Additional attributes not defined by the model

- **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

- **`generated`**

  `string | object` — Entity generated as a result of the interaction

- **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

- **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

- **`referrer`**

  `string | object` — The referrer of the session event

- **`session`**

  `string | object` — The current user Session

- **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "SessionEvent",
  "actor": "https://example.edu/software/123456",
  "action": "TimedOut",
  "object": "https://example.edu/sessions/123456",
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "SessionProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": "https://example.edu/users/554433/responses/1",
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/resources/123456",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```

### TimebackActivityCompletedEvent

- **Type:**`object`

* **`@context` (required)**

  `string`, format: `uri`, default: `"http://purl.imsglobal.org/ctx/caliper/v1p2"` — The context of the Caliper entity data

* **`action` (required)**

  `string`

* **`actor` (required)**

  `object` — # TimebackUser Represents a user in the context of the Timeback application. If possible, always send the user id as the oneroster url to get the user information. If the oneroster url is not available, send the user id as a url with your application base url. Example: https\://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/123

  - **`email` (required)**

    `string`, format: `email`

  - **`id` (required)**

    `string`, format: `uri` — The unique identifier for the actor

  - **`type` (required)**

    `string` — The type of this user. Must be set to 'TimebackUser'

  - **`extensions`**

    `object` — Additional attributes not defined by the model

  - **`name`**

    `string`

  - **`role`**

    `string`, possible values: `"student", "teacher", "admin", "guide"`

* **`eventTime` (required)**

  `string`, format: `date-time` — ISO 8601 datetime when this event occurred

* **`generated` (required)**

  `object` — # TimebackActivityMetricsCollection Represents a collection of activity metrics. The collection is used to store the metrics for a student's activity. Supported metrics: xpEarned, totalQuestions, correctQuestions, masteredUnits You can send an event with multiple metrics at once.

  - **`id` (required)**

    `string`, format: `uri` — The unique identifier for the collection

  - **`items` (required)**

    `array`

    **Items:**

    - **`type` (required)**

      `string`, possible values: `"xpEarned", "totalQuestions", "correctQuestions", "masteredUnits"`

    - **`value` (required)**

      `number`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

  - **`type` (required)**

    `string` — The type of the collection

  - **`extensions`**

    `object` — Additional attributes not defined by the model

* **`id` (required)**

  `string` — Unique identifier for this event. Must be a UUID expressed as a URN

* **`object` (required)**

  `object` — # TimebackActivityContext Represents the context of the activity where the event was recorded. This context represents a unified interface for third parties users of the timeback platform apis to send student metrics. These metrics can be processed in an ETL layer to create a unified view of student metrics in different applications.

  - **`app` (required)**

    `object` — The application where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`id` (required)**

    `string`, format: `uri`

  - **`subject` (required)**

    `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math", "None"`

  - **`type` (required)**

    `string`

  - **`activity`**

    `object` — The activity where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`course`**

    `object` — The course where the event was recorded

    - **`name` (required)**

      `string`

    - **`extensions`**

      `object` — Additional attributes not defined by the model

    - **`id`**

      `string`, format: `uri`

  - **`process`**

    `boolean`

* **`profile` (required)**

  `string` — The profile that governs interpretation of this event

* **`type` (required)**

  `string`

* **`edApp`**

  `string | object` — The application context

* **`extensions`**

  `object` — Additional attributes not defined by the model

* **`federatedSession`**

  `string | object` — If the Event occurs within the context of an LTI platform launch, the tool's LtiSession

* **`group`**

  `string | object` — An Organization that represents the group context. Can be either a URI or an Organization entity object

* **`membership`**

  `string | object` — The relationship between the action and the group in terms of roles and status

* **`referrer`**

  `string | object` — Entity that represents the referring context

* **`session`**

  `string | object` — The current user Session

* **`target`**

  `string | object` — Entity that represents a particular segment or location within the object

**Example:**

```
{
  "@context": "http://purl.imsglobal.org/ctx/caliper/v1p2",
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "type": "ActivityEvent",
  "actor": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>",
    "type": "TimebackUser",
    "email": "",
    "name": "",
    "role": "student",
    "extensions": {
      "customField": "customValue"
    }
  },
  "action": "Completed",
  "object": {
    "id": "",
    "type": "TimebackActivityContext",
    "subject": "Reading",
    "app": {
      "id": "https://your.app.url",
      "name": "Example App"
    },
    "course": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<courseSourcedId>",
      "name": "Example Course"
    },
    "activity": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/components/<componentSourcedId>",
      "name": "Example Activity"
    },
    "process": true
  },
  "eventTime": "2023-08-15T14:12:00.000Z",
  "profile": "TimebackProfile",
  "edApp": "https://example.edu/apps/learning-management",
  "generated": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/collections/1",
    "type": "TimebackActivityMetricsCollection",
    "items": [
      {
        "type": "xpEarned",
        "value": 1,
        "extensions": {
          "customField": "customValue"
        }
      }
    ],
    "extensions": {
      "customField": "customValue"
    }
  },
  "target": "https://example.edu/terms/201801/courses/7/sections/1/assignments/1/items/1",
  "referrer": "https://example.edu/terms/201801/courses/7/sections/1",
  "group": {
    "id": "https://example.edu/terms/201801/courses/7/sections/1",
    "type": "Organization",
    "extensions": {
      "info": "other params should follow organization schema"
    }
  },
  "membership": "https://example.edu/terms/201801/courses/7/sections/1/rosters/1",
  "session": "https://example.edu/sessions/1f6442a482de72ea6ad134943812bff564a76259",
  "federatedSession": "https://example.edu/lti-sessions/b533eb02823f31024765305dd3af7b5e",
  "extensions": {
    "customField": "customValue"
  }
}
```
