# EduBridge API

> Generated from: https://api.alpha-1edtech.com/edubridge/openapi.yaml
> Generated on: 2025-09-18T03:08:05.568Z

---

# Edubridge API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

# EduBridge API Overview

The Edubridge API provides simplified interfaces for digital schools to manage their digital courses and student enrollments, abstracting away the complexities of the OneRoster standard while maintaining compatibility.

It offers streamlined endpoints to enroll students in courses without the need to understand the underlying academic hierarchy.

This API significantly reduces integration complexity for third-party systems by handling the background creation and management of academic sessions (per year), classes (per course), and enrollment relationships, allowing consumers to focus on educational experiences rather than data management.

Entities involved in the Edubridge API:

- Year academic session (per school)
- Term academic session (spans the whole year)
- Class (per course + term)
- Enrollment (per student per class)

## Auto-managed entities

The Edubridge API automatically manages the following entities:

- Year academic session
- Term academic session (spans the whole year)
- Class (per course + term)

## Course-centric enrollment

This API offers a course-centric view of enrollments, allowing consumers to focus on what courses the student is enrolled in rather than details about the underlying academic hierarchy.

You as an API consumer do not need to understand the underlying academic hierarchy to use this API, if you are only interested in what courses a student is enrolled in.

Consumers that need to interact with the underlying academic hierarchy through flows not covered by this API can do so by using the raw OneRoster API.

## Pre-requisites

Before you can enroll a user in a course, you need the following entities created:

- A school or equivalent organization
- A course (linked to the organization via orgSourcedId)
- A user (that will be enrolled in the course)

## Servers

- **URL:** `https://api.alpha-1edtech.com`
  - **Description:** Edubridge API

## Operations

### Get the MAP profile for a given student

- **Method:** `GET`
- **Path:** `/edubridge/learning-reports/map-profile/{userId}`
- **Tags:** Edubridge - Learning Reports

Return the MAP profile for a given student

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `array`

  **Items:**

  - **`pdfUrl` (required)**

    `string | null`

  - **`tests` (required)**

    `array`

    **Items:**

    `string`

  - **`title` (required)**

    `string`

  - **`assessmentResultProviderSystem`**

    `string`

  - **`grade`**

    `string`

  - **`schoolname`**

    `string`

**Example:**

```
{
  "data": [
    {
      "title": "",
      "pdfUrl": null,
      "tests": [
        ""
      ],
      "grade": "",
      "schoolname": "",
      "assessmentResultProviderSystem": ""
    }
  ]
}
```

##### Status: 404 No MAP profile found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### List all facts for a given date range by email or studentId

- **Method:** `GET`
- **Path:** `/edubridge/analytics/activity`
- **Tags:** Edubridge - Analytics

Return a list of processed facts for a given date range by email or studentId

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`endDate` (required)**

  `string`, format: `date-time`

- **`facts` (required)**

  `object`

- **`factsByApp` (required)**

  `object`

- **`message` (required)**

  `string`

- **`startDate` (required)**

  `string`, format: `date-time`

**Example:**

```
{
  "message": "",
  "startDate": "",
  "endDate": "",
  "facts": {
    "propertyName*": {
      "propertyName*": {
        "activityMetrics": {
          "xpEarned": 1,
          "totalQuestions": 1,
          "correctQuestions": 1,
          "masteredUnits": 1
        },
        "timeSpentMetrics": {
          "activeSeconds": 1,
          "inactiveSeconds": 1,
          "wasteSeconds": 1
        },
        "apps": [
          ""
        ]
      }
    }
  },
  "factsByApp": {
    "propertyName*": {
      "propertyName*": {
        "propertyName*": {
          "activityMetrics": {
            "xpEarned": 1,
            "totalQuestions": 1,
            "correctQuestions": 1,
            "masteredUnits": 1
          },
          "timeSpentMetrics": {
            "activeSeconds": 1,
            "inactiveSeconds": 1,
            "wasteSeconds": 1
          },
          "apps": [
            ""
          ]
        }
      }
    }
  }
}
```

### List all facts for a given week by email or studentId

- **Method:** `GET`
- **Path:** `/edubridge/analytics/facts/weekly`
- **Tags:** Edubridge - Analytics

Return a list of processed facts for a given week by email or studentId

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`endDate` (required)**

  `string`, format: `date-time`

- **`facts` (required)**

  `array`

  **Items:**

  - **`activeSeconds` (required)**

    `string | null`

  - **`activityId` (required)**

    `string | null`

  - **`activityName` (required)**

    `string | null`

  - **`alphaLevel` (required)**

    `string | null`

  - **`app` (required)**

    `string | null`

  - **`campusId` (required)**

    `string | null`

  - **`campusName` (required)**

    `string | null`

  - **`correctQuestions` (required)**

    `number | null`

  - **`courseId` (required)**

    `string | null`

  - **`courseName` (required)**

    `string | null`

  - **`date` (required)**

    `string`

  - **`datetime` (required)**

    `string`

  - **`day` (required)**

    `number`

  - **`dayOfWeek` (required)**

    `number`

  - **`email` (required)**

    `string`

  - **`enrollmentId` (required)**

    `string | null`

  - **`eventType` (required)**

    `string | null`

  - **`generatedAt` (required)**

    `string | null`

  - **`id` (required)**

    `number`

  - **`inactiveSeconds` (required)**

    `string | null`

  - **`masteredUnits` (required)**

    `number | null`

  - **`month` (required)**

    `number`

  - **`sendTime` (required)**

    `string | null`

  - **`sensor` (required)**

    `string | null`

  - **`source` (required)**

    `string`

  - **`subject` (required)**

    `string | null`

  - **`totalQuestions` (required)**

    `number | null`

  - **`userFamilyName` (required)**

    `string | null`

  - **`userGivenName` (required)**

    `string | null`

  - **`userGrade` (required)**

    `string | null`

  - **`userId` (required)**

    `string | null`

  - **`username` (required)**

    `string | null`

  - **`wasteSeconds` (required)**

    `string | null`

  - **`year` (required)**

    `number`

  - **`xpEarned`**

    `number | null`

- **`message` (required)**

  `string`

- **`startDate` (required)**

  `string`, format: `date-time`

**Example:**

```
{
  "message": "",
  "startDate": "",
  "endDate": "",
  "facts": [
    {
      "id": 1,
      "email": "",
      "date": "",
      "datetime": "",
      "username": null,
      "userGrade": null,
      "userFamilyName": null,
      "userGivenName": null,
      "userId": null,
      "subject": null,
      "app": null,
      "courseId": null,
      "courseName": null,
      "campusId": null,
      "campusName": null,
      "enrollmentId": null,
      "activityId": null,
      "activityName": null,
      "totalQuestions": null,
      "correctQuestions": null,
      "xpEarned": null,
      "masteredUnits": null,
      "activeSeconds": null,
      "inactiveSeconds": null,
      "wasteSeconds": null,
      "source": "",
      "alphaLevel": null,
      "generatedAt": null,
      "sendTime": null,
      "sensor": null,
      "eventType": null,
      "year": 1,
      "month": 1,
      "day": 1,
      "dayOfWeek": 1
    }
  ]
}
```

### Gets the highest grade mastered by a student for a given subject

- **Method:** `GET`
- **Path:** `/edubridge/analytics/highestGradeMastered/:studentId/:subject`
- **Tags:** Edubridge - Analytics

Gets the highest grade mastered by a student for a given subject across different data sources (currently edulastic, placement and test out datasets)

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`grades` (required)**

  `object`

  - **`edulasticGrade` (required)**

    `object`

  - **`highestGradeOverall` (required)**

    `object`

  - **`placementGrade` (required)**

    `object`

  - **`ritGrade` (required)**

    `object`

  - **`testOutGrade` (required)**

    `object`

- **`studentId` (required)**

  `string` — The sourced\_id of the student for which to get the highest grade mastered

- **`subject` (required)**

  `string` — The subject for which to get the highest grade mastered

**Example:**

```
{
  "studentId": "",
  "subject": "",
  "grades": {
    "ritGrade": "3",
    "edulasticGrade": "3",
    "placementGrade": "3",
    "testOutGrade": "3",
    "highestGradeOverall": "3"
  }
}
```

### Get all subject tracks

- **Method:** `GET`
- **Path:** `/edubridge/subject-track/`
- **Tags:** Edubridge - Subject Track

List all subject tracks: the target course for each organization (school/campus), subject and grade level combination. Includes both organization-specific tracks and global tracks that apply to all organizations.

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`subjectTrack` (required)**

  `array`

  **Items:**

  - **`course` (required)**

    `object` — Represents a course.

    - **`org` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`

    - **`status` (required)**

      `string`, possible values: `"active", "tobedeleted"`

    - **`title` (required)**

      `string`

    - **`courseCode`**

      `string | null`

    - **`dateLastModified`**

      `string`, format: `date-time`

    - **`grades`**

      `array | null`

    - **`level`**

      `string | null`

    - **`metadata`**

      `object` — Additional metadata for the object

    - **`sourcedId`**

      `string`

    - **`subjectCodes`**

      `array | null`

    - **`subjects`**

      `array | null`

  - **`grade` (required)**

    `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

  - **`id` (required)**

    `string`

  - **`org` (required)**

    `object`

  - **`subject` (required)**

    `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"`

**Example:**

```
{
  "subjectTrack": [
    {
      "id": "",
      "grade": "3",
      "subject": "Reading",
      "course": {
        "sourcedId": "",
        "status": "active",
        "dateLastModified": "",
        "metadata": {
          "propertyName*": "anything"
        },
        "title": "",
        "courseCode": null,
        "grades": [
          "3"
        ],
        "subjects": [
          "Reading"
        ],
        "subjectCodes": [
          ""
        ],
        "org": {
          "sourcedId": ""
        },
        "level": null
      },
      "org": {
        "sourcedId": "",
        "status": "active",
        "dateLastModified": "",
        "metadata": null,
        "name": "",
        "type": "department",
        "identifier": "",
        "parent": {
          "href": "",
          "sourcedId": "",
          "type": ""
        },
        "children": []
      }
    }
  ]
}
```

### Create or update a subject track

- **Method:** `PUT`
- **Path:** `/edubridge/subject-track/`
- **Tags:** Edubridge - Subject Track

Creates a new subject track or updates an existing one for the given organization, subject and grade with upsert behavior. If orgSourcedId is provided, creates an organization-specific track. If omitted, creates a global track that applies to all organizations. There can be only one target course per organization, subject and grade level combination.

#### Request Body

##### Content-Type: application/json

- **`courseId` (required)**

  `string` — The course ID to associate with this track (required)

- **`grade` (required)**

  `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — The grade level for the track (required)

- **`subject` (required)**

  `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"` — The subject for the track (required)

- **`orgSourcedId`**

  `string` — Optional organization/school ID. If not provided, creates a global track that applies to all organizations

**Example:**

```
{
  "subject": "Reading",
  "grade": "3",
  "courseId": "",
  "orgSourcedId": ""
}
```

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`subjectTrack` (required)**

  `object`

  - **`course` (required)**

    `object` — Represents a course.

    - **`org` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`

    - **`status` (required)**

      `string`, possible values: `"active", "tobedeleted"`

    - **`title` (required)**

      `string`

    - **`courseCode`**

      `string | null`

    - **`dateLastModified`**

      `string`, format: `date-time`

    - **`grades`**

      `array | null`

    - **`level`**

      `string | null`

    - **`metadata`**

      `object` — Additional metadata for the object

    - **`sourcedId`**

      `string`

    - **`subjectCodes`**

      `array | null`

    - **`subjects`**

      `array | null`

  - **`grade` (required)**

    `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

  - **`id` (required)**

    `string`

  - **`org` (required)**

    `object`

  - **`subject` (required)**

    `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"`

**Example:**

```
{
  "subjectTrack": {
    "id": "",
    "grade": "3",
    "subject": "Reading",
    "course": {
      "sourcedId": "",
      "status": "active",
      "dateLastModified": "",
      "metadata": {
        "propertyName*": "anything"
      },
      "title": "",
      "courseCode": null,
      "grades": [
        "3"
      ],
      "subjects": [
        "Reading"
      ],
      "subjectCodes": [
        ""
      ],
      "org": {
        "sourcedId": ""
      },
      "level": null
    },
    "org": {
      "sourcedId": "",
      "status": "active",
      "dateLastModified": "",
      "metadata": null,
      "name": "",
      "type": "department",
      "identifier": "",
      "parent": {
        "href": "",
        "sourcedId": "",
        "type": ""
      },
      "children": []
    }
  }
}
```

### Delete a subject track

- **Method:** `DELETE`
- **Path:** `/edubridge/subject-track/{id}`
- **Tags:** Edubridge - Subject Track

Deletes a subject track by its ID

#### Responses

##### Status: 200 Subject track deleted successfully

###### Content-Type: application/json

- **`data` (required)**

  `null`

**Example:**

```
{
  "data": null
}
```

### List all subject track groups

- **Method:** `GET`
- **Path:** `/edubridge/subject-track/groups`
- **Tags:** Edubridge - Subject Track

Returns all subject tracks organized into logical groups. Groups are defined by subject, grade, course, and type (global vs campus-specific). Global groups contain a single track that applies to all organizations. Campus groups contain multiple tracks for specific organizations sharing the same subject, grade, and course.

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`groups` (required)**

  `array`

  **Items:**

  - **`key` (required)**

    `object`

    - **`courseId` (required)**

      `string`

    - **`grade` (required)**

      `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

    - **`isGlobal` (required)**

      `boolean`

    - **`subject` (required)**

      `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"`

  - **`tracks` (required)**

    `array`

    **Items:**

    - **`course` (required)**

      `object` — Represents a course.

      - **`org` (required)**

        `object`

        - **`sourcedId` (required)**

          `string`

      - **`status` (required)**

        `string`, possible values: `"active", "tobedeleted"`

      - **`title` (required)**

        `string`

      - **`courseCode`**

        `string | null`

      - **`dateLastModified`**

        `string`, format: `date-time`

      - **`grades`**

        `array | null`

      - **`level`**

        `string | null`

      - **`metadata`**

        `object` — Additional metadata for the object

      - **`sourcedId`**

        `string`

      - **`subjectCodes`**

        `array | null`

      - **`subjects`**

        `array | null`

    - **`grade` (required)**

      `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

    - **`id` (required)**

      `string`

    - **`org` (required)**

      `object`

    - **`subject` (required)**

      `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"`

**Example:**

```
{
  "groups": [
    {
      "key": {
        "subject": "Reading",
        "grade": "3",
        "courseId": "",
        "isGlobal": true
      },
      "tracks": [
        {
          "id": "",
          "grade": "3",
          "subject": "Reading",
          "course": {
            "sourcedId": "",
            "status": "active",
            "dateLastModified": "",
            "metadata": {
              "propertyName*": "anything"
            },
            "title": "",
            "courseCode": null,
            "grades": [
              "3"
            ],
            "subjects": [
              "Reading"
            ],
            "subjectCodes": [
              ""
            ],
            "org": {
              "sourcedId": ""
            },
            "...": "[Additional Properties Truncated]"
          },
          "org": {
            "sourcedId": "",
            "status": "active",
            "dateLastModified": "",
            "metadata": null,
            "name": "",
            "type": "department",
            "identifier": "",
            "parent": {
              "href": "",
              "sourcedId": "",
              "type": ""
            },
            "children": []
          }
        }
      ]
    }
  ]
}
```

### Create a subject track group

- **Method:** `POST`
- **Path:** `/edubridge/subject-track/groups`
- **Tags:** Edubridge - Subject Track

Creates a new subject track group. If orgSourcedIds is empty, creates a global track that applies to all organizations. If orgSourcedIds contains organization IDs, creates campus-specific tracks for each organization. All tracks in the group will have the same subject, grade, and course.

#### Request Body

##### Content-Type: application/json

- **`courseId` (required)**

  `string` — The course ID to associate with all tracks in this group (required)

- **`grade` (required)**

  `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — The grade level for the track group (required)

- **`subject` (required)**

  `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"` — The subject for the track group (required)

- **`orgSourcedIds`**

  `array`, default: `[]` — Array of organization IDs for campus-specific tracks. Empty array creates a global track that applies to all organizations

  **Items:**

  `string`

**Example:**

```
{
  "subject": "Reading",
  "grade": "3",
  "courseId": "",
  "orgSourcedIds": []
}
```

#### Responses

##### Status: 204 Group created successfully

### Update a subject track group

- **Method:** `PUT`
- **Path:** `/edubridge/subject-track/groups`
- **Tags:** Edubridge - Subject Track

Updates an existing subject track group by replacing all tracks in the group. The group is identified by subject, grade, currentCourseId, and isGlobal. All existing tracks in the group will be deleted and new tracks created with the specified configuration. Supports changing the course and organization list for the group.

#### Request Body

##### Content-Type: application/json

- **`courseId` (required)**

  `string` — The new course ID to associate with all tracks in this group

- **`currentCourseId` (required)**

  `string` — The current course ID to identify the existing group

- **`grade` (required)**

  `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — The grade level for the track group (required)

- **`isGlobal` (required)**

  `boolean` — Whether this is a global group (true) or campus group (false)

- **`subject` (required)**

  `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"` — The subject for the track group (required)

- **`orgSourcedIds`**

  `array`, default: `[]` — Array of organization IDs for the updated group. Empty array converts to global track

  **Items:**

  `string`

- **`strategy`**

  `string`, possible values: `"replace", "fail"`, default: `"replace"` — Conflict resolution strategy: replace existing tracks or fail on conflicts

**Example:**

```
{
  "subject": "Reading",
  "grade": "3",
  "currentCourseId": "",
  "courseId": "",
  "isGlobal": true,
  "orgSourcedIds": [],
  "strategy": "replace"
}
```

#### Responses

##### Status: 204 Group updated successfully

### Delete a subject track group

- **Method:** `DELETE`
- **Path:** `/edubridge/subject-track/groups`
- **Tags:** Edubridge - Subject Track

Deletes all subject tracks in a group. The group is identified by subject, grade, courseId, and isGlobal. All tracks belonging to this group will be permanently removed.

#### Request Body

##### Content-Type: application/json

- **`courseId` (required)**

  `string` — The course ID to identify the group to delete

- **`grade` (required)**

  `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — The grade level for the track group (required)

- **`isGlobal` (required)**

  `boolean` — Whether this is a global group (true) or campus group (false)

- **`subject` (required)**

  `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"` — The subject for the track group (required)

**Example:**

```
{
  "subject": "Reading",
  "grade": "3",
  "courseId": "",
  "isGlobal": true
}
```

#### Responses

##### Status: 204 Group deleted successfully

### Get all applications

- **Method:** `GET`
- **Path:** `/edubridge/applications/`
- **Tags:** Edubridge - Applications

List all applications available in the system

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`applications` (required)**

  `array`

  **Items:**

  - **`clientAppId` (required)**

    `string | null`

  - **`dateLastModified` (required)**

    `string`

  - **`description` (required)**

    `string | null`

  - **`domain` (required)**

    `array`

    **Items:**

    `string`

  - **`name` (required)**

    `string`

  - **`sourcedId` (required)**

    `string`

  - **`status` (required)**

    `string`

  - **`tenantId` (required)**

    `string | null`

  - **`metadata`**

    `null`

**Example:**

```
{
  "applications": [
    {
      "sourcedId": "",
      "name": "",
      "description": null,
      "domain": [
        ""
      ],
      "tenantId": null,
      "clientAppId": null,
      "status": "",
      "dateLastModified": "",
      "metadata": null
    }
  ]
}
```

### Get all metrics for an application

- **Method:** `GET`
- **Path:** `/edubridge/applicationMetrics/{applicationSourcedId}`
- **Tags:** Edubridge - Application Metrics

Returns all application metrics for a given application.

This endpoint provides a way to retrieve all tracked metrics associated with an application, including the metric type and source information.

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `array`

  **Items:**

  - **`applicationSourcedId` (required)**

    `string` — The application sourced id

  - **`metric` (required)**

    `string`, possible values: `"xp", "spent_minutes", "waste_minutes", "accuracy", "lessons", "quizzes", "unit_tests"` — The metric

  - **`metricSource` (required)**

    `string`, possible values: `"timeback_app", "timeback_direct_integration", "timeback_adapter", "powerpath", "manual_entry"` — The metric source

**Example:**

```
{
  "data": [
    {
      "applicationSourcedId": "",
      "metric": "xp",
      "metricSource": "timeback_app"
    }
  ]
}
```

### Create a new application metric

- **Method:** `POST`
- **Path:** `/edubridge/applicationMetrics/{applicationSourcedId}`
- **Tags:** Edubridge - Application Metrics

Creates a new application metric for tracking.

This endpoint allows you to record metrics associated with an application, specifying the metric type and source for proper categorization.

#### Request Body

##### Content-Type: application/json

- **`applicationMetric` (required)**

  `object`

  - **`metric` (required)**

    `string`, possible values: `"xp", "spent_minutes", "waste_minutes", "accuracy", "lessons", "quizzes", "unit_tests"` — The metric

  - **`metricSource` (required)**

    `string`, possible values: `"timeback_app", "timeback_direct_integration", "timeback_adapter", "powerpath", "manual_entry"` — The metric source

**Example:**

```
{
  "applicationMetric": {
    "metric": "xp",
    "metricSource": "timeback_app"
  }
}
```

#### Responses

##### Status: 201 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `object`

  - **`applicationSourcedId` (required)**

    `string` — The application sourced id

  - **`metric` (required)**

    `string`, possible values: `"xp", "spent_minutes", "waste_minutes", "accuracy", "lessons", "quizzes", "unit_tests"` — The metric

  - **`metricSource` (required)**

    `string`, possible values: `"timeback_app", "timeback_direct_integration", "timeback_adapter", "powerpath", "manual_entry"` — The metric source

**Example:**

```
{
  "data": {
    "applicationSourcedId": "",
    "metric": "xp",
    "metricSource": "timeback_app"
  }
}
```

### Delete an application metric

- **Method:** `DELETE`
- **Path:** `/edubridge/applicationMetrics/{applicationSourcedId}`
- **Tags:** Edubridge - Application Metrics

Deletes a specific application metric.

This endpoint removes a specific metric record identified by the application ID, metric type, and metric source.

#### Request Body

##### Content-Type: application/json

- **`applicationMetric` (required)**

  `object`

  - **`metric` (required)**

    `string`, possible values: `"xp", "spent_minutes", "waste_minutes", "accuracy", "lessons", "quizzes", "unit_tests"` — The metric

  - **`metricSource` (required)**

    `string`, possible values: `"timeback_app", "timeback_direct_integration", "timeback_adapter", "powerpath", "manual_entry"` — The metric source

**Example:**

```
{
  "applicationMetric": {
    "metric": "xp",
    "metricSource": "timeback_app"
  }
}
```

#### Responses

##### Status: 204 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `null`

**Example:**

```
{
  "data": null
}
```

### Get the default class for a course

- **Method:** `GET`
- **Path:** `/edubridge/enrollments/defaultClass/{courseId}/{schoolId}?`
- **Tags:** Edubridge - Enrollments

Retrieves and automatically creates a default class (and other necessary academic entities) for the specified course.

This endpoint simplifies the management of digital learning by abstracting away the need to manually create class structures.

For digital-only courses, this endpoint ensures that the necessary academic structure (school year, term, class) exists without requiring the consumer to understand or manage this complex hierarchy. The class is created with appropriate digital-friendly settings.

You do not need to call this endpoint unless you have a use case where you want to manage the underlying academic structure (school year, term, class) for a course.

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `object`

  - **`classCode` (required)**

    `string | null`

  - **`course` (required)**

    `object`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

    - **`title` (required)**

      `string`

    - **`grades`**

      `array | null`

    - **`primaryApp`**

      `object | null`

      - **`domains` (required)**

        `array`

        **Items:**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

    - **`subjects`**

      `array | null`

  - **`grades` (required)**

    `array`

    **Items:**

    **All of:**

    `string`, possible values: `"-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"` — Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

  - **`id` (required)**

    `string`

  - **`periods` (required)**

    `array`

    **Items:**

    `string`

  - **`subjectCodes` (required)**

    `array`

    **Items:**

    `string`

  - **`subjects` (required)**

    `array`

    **Items:**

    **All of:**

    `string`, possible values: `"Reading", "Language", "Vocabulary", "Social Studies", "Writing", "Science", "FastMath", "Math"`

  - **`title` (required)**

    `string`

**Example:**

```
{
  "data": {
    "id": "123",
    "title": "",
    "classCode": null,
    "subjectCodes": [
      ""
    ],
    "subjects": [
      "Reading"
    ],
    "grades": [
      "3"
    ],
    "periods": [
      ""
    ],
    "course": {
      "id": "",
      "title": "",
      "metadata": {
        "propertyName*": "anything"
      },
      "subjects": [
        ""
      ],
      "grades": [
        ""
      ],
      "primaryApp": {
        "id": "",
        "name": "",
        "domains": [
          ""
        ]
      }
    }
  }
}
```

### Enroll user in a course

- **Method:** `POST`
- **Path:** `/edubridge/enrollments/enroll/{userId}/{courseId}/{schoolId}?`
- **Tags:** Edubridge - Enrollments

Enrolls a user in a course with a single API call.

This endpoint handles all necessary background operations: locating or creating a default class for the course, establishing appropriate academic sessions (school year and term), and creating the enrollment record.

Consumers can simply specify the user, course, and role (default is 'student') without needing to understand or manage the underlying academic structure that OneRoster requires.

#### Request Body

##### Content-Type: application/json

- **`beginDate`**

  `string`, format: `date-time` — The date the user is enrolled in the course, defaults to today

- **`metadata`**

  `object`

  - **`goals`**

    `object`

    - **`dailyAccuracy`**

      `number`

    - **`dailyActiveMinutes`**

      `number`

    - **`dailyLessons`**

      `number`

    - **`dailyMasteredUnits`**

      `number`

    - **`dailyXp`**

      `number`

  - **`metrics`**

    `object`

    - **`totalLessons`**

      `number`

    - **`totalXp`**

      `number`

  - **`studentSpecificGoals`**

    `boolean`

- **`role`**

  `string`, possible values: `"administrator", "proctor", "student", "teacher"`, default: `"student"`

- **`sourcedId`**

  `string` — Optional client-provided ID for the enrollment

**Example:**

```
{
  "sourcedId": "",
  "role": "student",
  "beginDate": "",
  "metadata": {
    "goals": {
      "dailyXp": 1,
      "dailyLessons": 1,
      "dailyActiveMinutes": 1,
      "dailyAccuracy": 1,
      "dailyMasteredUnits": 1
    },
    "metrics": {
      "totalXp": 1,
      "totalLessons": 1
    },
    "studentSpecificGoals": true,
    "propertyName*": "anything"
  }
}
```

#### Responses

##### Status: 201 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `object`

  - **`beginDate` (required)**

    `string | null`

  - **`course` (required)**

    `object`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

    - **`title` (required)**

      `string`

    - **`grades`**

      `array | null`

    - **`primaryApp`**

      `object | null`

      - **`domains` (required)**

        `array`

        **Items:**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

    - **`subjects`**

      `array | null`

  - **`endDate` (required)**

    `string | null`

  - **`id` (required)**

    `string`

  - **`role` (required)**

    `string`, possible values: `"administrator", "proctor", "student", "teacher"`

  - **`school` (required)**

    `object`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

  - **`metadata`**

    `object`

    - **`goals`**

      `object`

      - **`dailyAccuracy`**

        `number`

      - **`dailyActiveMinutes`**

        `number`

      - **`dailyLessons`**

        `number`

      - **`dailyMasteredUnits`**

        `number`

      - **`dailyXp`**

        `number`

    - **`metrics`**

      `object`

      - **`totalLessons`**

        `number`

      - **`totalXp`**

        `number`

    - **`studentSpecificGoals`**

      `boolean`

**Example:**

```
{
  "data": {
    "id": "123",
    "role": "administrator",
    "beginDate": null,
    "endDate": null,
    "metadata": {
      "goals": {
        "dailyXp": 1,
        "dailyLessons": 1,
        "dailyActiveMinutes": 1,
        "dailyAccuracy": 1,
        "dailyMasteredUnits": 1
      },
      "metrics": {
        "totalXp": 1,
        "totalLessons": 1
      },
      "studentSpecificGoals": true,
      "propertyName*": "anything"
    },
    "course": {
      "id": "",
      "title": "",
      "metadata": {
        "propertyName*": "anything"
      },
      "subjects": [
        ""
      ],
      "grades": [
        ""
      ],
      "primaryApp": {
        "id": "",
        "name": "",
        "domains": [
          ""
        ]
      }
    },
    "school": {
      "id": "",
      "name": ""
    }
  }
}
```

### Propagate course goals to all enrollments

- **Method:** `POST`
- **Path:** `/edubridge/enrollments/propagateGoals/{courseId}`
- **Tags:** Edubridge - Enrollments

Propagates the course's current goals to its enrollments if the enrollment does not have custom goals. The custom goals verification for the enrollment is done by checking the studentSpecificGoals metadata field.

#### Responses

##### Status: 200 Goals successfully propagated

###### Content-Type: application/json

- **`data` (required)**

  `object`

  - **`errors` (required)**

    `array` — List of errors encountered during propagation

    **Items:**

    `string`

  - **`updated` (required)**

    `number` — Number of enrollments successfully updated

**Example:**

```
{
  "data": {
    "updated": 1,
    "errors": [
      ""
    ]
  }
}
```

##### Status: 404 Course not found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Course has no goals defined

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Resets an user's progress in a given course

- **Method:** `DELETE`
- **Path:** `/edubridge/enrollments/resetProgress/{userId}/{courseId}`
- **Tags:** Edubridge - Enrollments

Reset the progress an user has made in a given course.

This endpoint finds all assessment results to associated a given course and user and marks them as 'tobedeleted'.

This endpoint is not responsible for deleting results and progress in third party apps.

#### Responses

##### Status: 204 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `null`

**Example:**

```
{
  "data": null
}
```

### Unenroll a user from a course

- **Method:** `DELETE`
- **Path:** `/edubridge/enrollments/unenroll/{userId}/{courseId}/{schoolId}?`
- **Tags:** Edubridge - Enrollments

Unenrolls a user from a course with a single API call.

This endpoint automatically handles finding the appropriate class enrollment(s) for the course and marking them as 'tobedeleted'.

Consumers don't need to know which specific class the user is enrolled in or manage the enrollment status transitions required by OneRoster.

#### Responses

##### Status: 204 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `null`

**Example:**

```
{
  "data": null
}
```

### Get all active enrollments for a user

- **Method:** `GET`
- **Path:** `/edubridge/enrollments/user/{userId}`
- **Tags:** Edubridge - Enrollments

Returns a simplified, course-centric view of all active enrollments for a user.

This endpoint abstracts away the complex OneRoster academic hierarchy, providing a streamlined representation that focuses on what courses the user is enrolled in rather than details about classes, sections, and academic sessions.

The response includes essential course information without the need to navigate multiple relationship levels.

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `array`

  **Items:**

  - **`beginDate` (required)**

    `string | null`

  - **`course` (required)**

    `object`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

    - **`title` (required)**

      `string`

    - **`grades`**

      `array | null`

    - **`primaryApp`**

      `object | null`

      - **`domains` (required)**

        `array`

        **Items:**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

    - **`subjects`**

      `array | null`

  - **`endDate` (required)**

    `string | null`

  - **`id` (required)**

    `string`

  - **`role` (required)**

    `string`, possible values: `"administrator", "proctor", "student", "teacher"`

  - **`school` (required)**

    `object`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

  - **`metadata`**

    `object`

    - **`goals`**

      `object`

      - **`dailyAccuracy`**

        `number`

      - **`dailyActiveMinutes`**

        `number`

      - **`dailyLessons`**

        `number`

      - **`dailyMasteredUnits`**

        `number`

      - **`dailyXp`**

        `number`

    - **`metrics`**

      `object`

      - **`totalLessons`**

        `number`

      - **`totalXp`**

        `number`

    - **`studentSpecificGoals`**

      `boolean`

**Example:**

```
{
  "data": [
    {
      "id": "123",
      "role": "administrator",
      "beginDate": null,
      "endDate": null,
      "metadata": {
        "goals": {
          "dailyXp": 1,
          "dailyLessons": 1,
          "dailyActiveMinutes": 1,
          "dailyAccuracy": 1,
          "dailyMasteredUnits": 1
        },
        "metrics": {
          "totalXp": 1,
          "totalLessons": 1
        },
        "studentSpecificGoals": true,
        "propertyName*": "anything"
      },
      "course": {
        "id": "",
        "title": "",
        "metadata": {
          "propertyName*": "anything"
        },
        "subjects": [
          ""
        ],
        "grades": [
          ""
        ],
        "primaryApp": {
          "id": "",
          "name": "",
          "domains": [
            ""
          ]
        }
      },
      "school": {
        "id": "",
        "name": ""
      }
    }
  ]
}
```

### Get total time saved for a student this school year

- **Method:** `GET`
- **Path:** `/edubridge/time-saved/user/{userId}`
- **Tags:** Edubridge - Enrollments

Calculates the total time a student has "got back" during the current school year.

This endpoint compares the personalized learning system's efficient 2-hour daily study time against traditional school schedules (6 hours class + 1 hour homework = 7 hours total), resulting in 5 hours saved per school day.

The calculation starts from the student's earliest valid enrollment date within the current school year (or the school year start date if they enrolled earlier) and counts only actual school days (excluding weekends, holidays, breaks, and MAP testing days).

**Formula:** Number of school days elapsed × 5 hours saved per day = Total hours saved

The response includes both the total hours saved and equivalent full days saved (hours ÷ 24).

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`data` (required)**

  `object` — Time saved calculation for the student during the current school year

  - **`calculation` (required)**

    `object`

    - **`formula` (required)**

      `string` — Human-readable calculation formula

    - **`hoursSavedPerDay` (required)**

      `number` — Hours saved per day (standard - personalized learning)

    - **`standardSchoolHoursPerDay` (required)**

      `number` — Standard school hours per day (6 hours class + 1 hour homework)

    - **`timebackHoursPerDay` (required)**

      `number` — Personalized learning hours per day

  - **`earliestStartDate` (required)**

    `string`, format: `date-time` — Earliest valid enrollment date for the student or school year start date

  - **`schoolDaysElapsed` (required)**

    `number` — Number of school days elapsed since earliest enrollment

  - **`schoolYearStartDate` (required)**

    `string`, format: `date-time` — Start date of the current school year

  - **`totalDaysSaved` (required)**

    `number` — Total full days saved (totalHoursSaved / 24)

  - **`totalHoursSaved` (required)**

    `number` — Total hours saved during the current school year

**Example:**

```
{
  "data": {
    "totalHoursSaved": 600,
    "totalDaysSaved": 25,
    "schoolDaysElapsed": 120,
    "earliestStartDate": "2024-08-25T00:00:00.000Z",
    "schoolYearStartDate": "2024-08-15T00:00:00.000Z",
    "calculation": {
      "standardSchoolHoursPerDay": 7,
      "timebackHoursPerDay": 2,
      "hoursSavedPerDay": 5,
      "formula": "120 school days × 5 hours saved per day = 600 hours"
    }
  }
}
```

##### Status: 404 Student not found or no enrollments found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

## Schemas

### NotFoundResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### GradeEnum

- **Type:**`string`

Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

**Example:**

### SubjectEnum

- **Type:**`string`

**Example:**

### Org

- **Type:**`object`

Represents an organization.

- **`children` (required)**

  `array | null`, default: `[]`

- **`identifier` (required)**

  `string`

- **`name` (required)**

  `string`

- **`sourcedId` (required)**

  `string`

- **`status` (required)**

  `string`, possible values: `"active", "tobedeleted"`

- **`type` (required)**

  `string`, possible values: `"department", "school", "district", "local", "state", "national"`

- **`dateLastModified`**

  `string`, format: `date-time`

- **`metadata`**

  `object | null`

- **`parent`**

  `object | null`

  - **`href` (required)**

    `string`, format: `uri`

  - **`sourcedId` (required)**

    `string`

  - **`type` (required)**

    `string`

**Example:**

```
{
  "sourcedId": "",
  "status": "active",
  "dateLastModified": "",
  "metadata": null,
  "name": "",
  "type": "department",
  "identifier": "",
  "parent": {
    "href": "",
    "sourcedId": "",
    "type": ""
  },
  "children": []
}
```

### UnprocessableEntityResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```
