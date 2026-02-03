# Impressions Helper React Frontend 

The impressions helper is a dashboard featuring a heat map of impression usage by date and flag name.  An analyst can quickly find the "hot spots" of flag evaluation, even with hundreds of flags.

The backend is a simple lambda that uses an Athena query to retrieve data and pass it to the frontend.

## Installing

Involved. 

Set up a Harness FME S3 integration.  It will take several weeks to fill, but proceed with these insuctions, noting the bucket name.

Install the impressions helper lambda [Lambda Backend Repo](https://github.com/dbmartin00/impressions-helper-backend). The lambda uses Athena.  Harness FME s3 integration is the root, and then data is marshalled as tables into Athena. 

Assuming your database is "split", create a database and then create a table for querying impressions.

```
CREATE EXTERNAL TABLE IF NOT EXISTS split.impressions4 (
  key STRING,
  label STRING,
  treatment STRING,
  splitName STRING,
  splitVersion INT,
  environmentId STRING,
  trafficTypeId STRING,
  sdk STRING,
  sdkVersion STRING,
  timestamp INT,
  receptionTimestamp INT
)
STORED AS PARQUET
LOCATION 's3://impressions-for-____/schema-v1/';
```

Note that you should use your S3 Harness FME bucket name as LOCATION.

## Deploy this repo as a React application.

Supply an environment variable:

```
export REACT_APP_HARNESS_IMPRESSIONS_HELPER=<path to impression help lambda function url>
```

## Data Arrival
It can take days or weeks for the table to fill up. Query the table with Athena to be sure data is arriving.

Then deploy this React application.  Use environment variable REACT_APP_HARNESS_IMPRESSIONS_HELPER to specify the URL of the backend lambda.


## Expected Dashboard

Basic stats about impressions, plus an expansive heat map illustrating where flags are being tested across all environments.

