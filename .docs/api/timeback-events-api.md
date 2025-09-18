# Timeback Events API

> Generated from: https://caliper.alpha-1edtech.com/timeback/openapi.yaml
> Generated on: 2025-09-18T03:08:05.327Z

---

# Timeback Events API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

# Documentation

## Overview

The Timeback Profile extends the IMS Caliper Analytics® specification to enable precise tracking of student activities and time spent metrics in educational platforms. This profile provides specialized event types that capture educational engagement data in a format optimized for the Timeback platform.

## Why Use Timeback Profile?

While the standard Caliper Analytics specification offers many generic event types, the Timeback Profile provides:

- Event types specifically designed for the context of the Timeback platform APIs
- Simplified structure for common educational platform analytics needs
- Direct support for XP/rewards, time tracking, question metrics and others
- Optimized integration with Timeback platform analytics (ETL)

# Event Types

The Timeback Profile currently supports two primary event types:

## 1. ActivityEvent

Used to record student interaction with educational activities, including total questions answered, correct questions and so on...

### Example

```json
{
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "eventTime": "2024-04-24T14:12:00.000Z",
  "profile": "TimebackProfile",
  "type": "ActivityEvent",
  "actor": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>",
    "type": "TimebackUser",
    "email": "student.email@example.com"
  },
  "action": "Completed",
  "object": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/component-resources/<sourcedId>",
    "type": "TimebackActivityContext",
    "subject": "Reading",
    "app": {
      "name": "PowerPath UI"
    },
    "activity": {
      "name": "Answered quiz"
    },
    "course": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<course-id>",
      "name": "Reading G3"
    },
    "process": false
  },
  "generated": {
    "id": "https://your-app-url.com/ims/metrics/collections/activity/1",
    "type": "TimebackActivityMetricsCollection",
    "items": [
      {
        "type": "totalQuestions",
        "value": 10
      },
      {
        "type": "correctQuestions",
        "value": 8
      },
      {
        "type": "xpEarned",
        "value": 100
      },
      {
        "type": "masteredUnits",
        "value": 2
      }
    ]
  }
}
```

### Properties

- **id**: (string *required*) Unique identifier for this event. Must be a UUID expressed as a URN `Pattern:^urn:uuid:(.*)$`

- **eventTime**: (string *required*) ISO 8601 timestamp when the event occurred

- **profile**: (string *required*) Always "TimebackProfile"

- **type**: (string *required*) Always "ActivityEvent"

- **actor**: (object *required*) The user performing the action (should always be a valid timeback user)

  - **id**: (string *required*) The OneRoster url representing the user (`https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>`)
  - **type**: (string *required*) Always "TimebackUser"
  - **email**: (string *required*) The current user email

- **action**: (string *required*) The action that was performed by the user (for now we only support "Completed")

- **object**: (object *required*) The activity being interacted with (TimebackActivityContext)

  - **id**: (string *required*) The unique URL that represents that lesson / activity. It should either be `https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/component-resources/<sourcedId>` or the URL of the activity being tracked on the external app. If the app doesn't have an unique URL per activity, you might concatenate any unique identifier to the base URL.

  - **type**: (string *required*) Always "TimebackActivityContext"

  - **subject**": (string *required*) The subject of the course (Reading, Language, Vocabulary, Social Studies, Writing, Science, FastMath, Math, None)

  - **app**: (object) *only required for third-party apps*
    - **name**: (string) App name

  - **activity** (object)
    - **name**: (string) The title of the activity

  - **course**: (object *required*)

    - **id**: (string *required*) The OneRoster URL representing the course (`https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<course-id>`). Refer to the [Integration Guide](https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.7zbgofrooex2#heading=h.ihrw14h4ub2f) for instructions on retrieving the courses the student is currently enrolled in.
    - **name**: (string) The title of the course

  - **process**: (boolean) Default is false. A flag to identify if this Caliper event should be processed into an Assessment Result in OneRoster.

- **generated**: (object *required*) The collection of metrics collected in the activity (TimebackActivityMetricsCollection)

  - **id**: (string *required*) The unique URN identifier representing this tracking action. This is not the same as `object.id` but could be derived from it.
  - **type**: (string *required*) Always "TimebackActivityMetricsCollection"
  - **attempt**: (integer) Default is 1. Use this along with `object.process = true` to guarantee a separate Assessment Result is written to OneRoster for the same user on the same activity. Repeated attempt numbers will overwrite the previous information.
  - **items**: (array *required*) The values you want to write in the analytics. Each entry is an object with type and value. The allowed types are: "totalQuestions", "correctQuestions", "xpEarned", and "masteredUnits".

The **process** property will create an Assessment Result on TimeBack. If you are already saving the result of the activity/lesson on TimeBack and just want to record the student XP, you need to pass this property as false.

The course information(other than the id) passed to the event is used as a fallback if some field is not present in the TimeBack API. Keep in mind that the course on the API side should be considered the source of truth for the information on the reports.

The events **cannot** be modified after they have been sent. Make sure you are sending the correct information. If you send the wrong XP for a student, you can send another event with a negative XP to balance the student to the correct value. (e.g. if you send 10 XP wrongly and the student should only receive 5, you can send a new event with -5 XP)

## 2. TimeSpentEvent

Used to record the time spent by the student in activities

### Example

```json
{
  "id": "urn:uuid:c51570e4-f8ed-4c18-bb3a-dfe51b2cc594",
  "eventTime": "2024-04-24T14:12:00.000Z",
  "profile": "TimebackProfile",
  "type": "TimeSpentEvent",
  "actor": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/<userId>",
    "type": "TimebackUser",
    "email": "student.email@example.com"
  },
  "action": "SpentTime",
  "object": {
    "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/component-resources/<sourcedId>",
    "type": "TimebackActivityContext",
    "subject": "Reading",
    "app": {
      "name": "PowerPath UI"
    },
    "activity": {
      "name": "Answered quiz"
    },
    "course": {
      "id": "https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<course-id>",
      "name": "Reading G3"
    }
  },
  "generated": {
    "id": "https://your-app-url.com/ims/metrics/collections/activity/1",
    "type": "TimebackTimeSpentMetricsCollection",
    "items": [
      {
        "type": "active",
        "value": 10 // in seconds
      },
      {
        "type": "waste",
        "value": 2, // in seconds
        "subType": "eating"
      },
      {
        "type": "inactive",
        "value": 2 // in seconds
      },
      {
        "type": "unknown",
        "value": 5 // in seconds
      },
      {
        "type": "anti-pattern",
        "value": 8 // in seconds
      }
    ]
  }
}
```

### Required Properties

- **id**: (string *required*) Unique identifier for this event. Must be a UUID expressed as a URN `Pattern:^urn:uuid:(.*)$`

- **eventTime**: (string required) ISO 8601 timestamp when the event occurred

- **profile**: (string *required*) Always "TimebackProfile"

- **type**: (string *required*) Always "TimeSpentEvent"

- **actor**: (object *required*) The user performing the action (should always be a valid timeback user)

  - **id**: (string *required*) The OneRoster URL representing the user (<https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/users/>)
  - **type**: (string *required*) Always "TimebackUser"
  - **email**: (string *required*) The current user email

- **action**: (string *required*) The action that was performed by the user (for now we only support "SpentTime")

- **object**: (object *required*) The activity being interacted with (TimebackActivityContext)

  - **id**: (string *required*) The unique URL that represents that lesson / activity. It should either be <https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/component-resources/> or the URL of the activity being tracked on the external app. If the app doesn't have an unique URL per activity, you might concatenate any unique identifier to the base URL.

  - **type**: (string *required*) Always "TimebackActivityContext"

  - **subject**: (string *required*) The subject of the course (Reading, Language, Vocabulary, Social Studies, Writing, Science, FastMath, Math, None)

  - **app**: (object) only required for third-party apps
    - **name**: (string) App name

  - **activity**: (object)
    - **name**: (string) The title of the activity

  - **course**: (object)

    - **id**: (string) The OneRoster URL representing the course (<https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/>). Refer to the Integration Guide for instructions on retrieving the courses the student is currently enrolled in.
    - **name**: (string) The title of the course

  - **generated**: (object *required*) The collection of timespent metrics collected in the activity

    - **id**: (string *required*) URL of the lesson/activity in your side.

    - **type**: (string *required*) Always "TimebackTimeSpentMetricsCollection"

    - **items**: (array *required*) The list of time metrics for the student in that activity

      - **type**: (enum *required*) One of the following: active, inactive, waste, unknown, anti-pattern.
      - **value**: (number *required*) time in seconds.
      - **subType**: (string) A more specific classification (e.g., "eating").

All the values in the `generated.items` should be in seconds.

# Examples

In the event endpoints described in this documentation there are various examples of how to send these activity and time spent events.

If your use-case isn't covered here please contact the timeback platform team.

# Notes

- Timeback/Oneroster Entities

  - If your app uses data (users, courses, resources, assessments...) from the Timeback platform APIs such as oneroster
  - it is useful (though not required) to send the "**id**" of the entities in the timeback events as the url in **oneroster** to get the information for the specific entity
  - Example: course (from oneroster) `https://api.alpha-1edtech.com/ims/oneroster/rostering/v1p2/courses/<course-id-here>`

- ActivityContext

  - In the activity context the "**course**" and "**activity**" fields are **optional**
  - You should provide them whenever possible and only leave them empty if you don't have access to this information.

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
  - **Description:** Timeback Events API

## Operations

### Create Caliper Events

- **Method:** `POST`
- **Path:** `/caliper/event`
- **Tags:** Caliper Events

Receives and processes Timeback events wrapped in an envelope. Events will be validated against the IMS Caliper Analytics specification and stored for further processing and analysis.

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

This endpoint is useful to prepare the event payload before sending them to the ingestion endpoint. When you send an event via this endpoint it will only be validated and not stored.

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

### AllProfiles

- **Type:**`string`

# Supported Profiles

These are the profiles that this API currently supports.

See the [specification](https://www.imsglobal.org/spec/caliper/v1p2#profiles-0) for a list of all profiles.

**Example:**

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
