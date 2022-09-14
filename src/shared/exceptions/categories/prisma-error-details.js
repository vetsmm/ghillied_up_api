"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.PrismaErrorDetails = exports.MigrationErrorDetails = exports.QueryErrorDetails = exports.CommonErrorDetails = void 0;
exports.CommonErrorDetails = {
    /**
     * Authentication failed against database server at `{database_host}`, the provided database credentials for `{database_user}` are not valid. Please make sure to provide valid database credentials for the database server at `{database_host}`.
     */
    P1000: 'An authentication error occurred while connecting to the database server.',
    /**
     * Can't reach database server at `{database_host}`:`{database_port}` Please make sure your database server is running at `{database_host}`:`{database_port}`.
     */
    P1001: 'Unable to connect to the database server.',
    /**
     * The database server at `{database_host}`:`{database_port}` was reached but timed out. Please try again. Please make sure your database server is running at `{database_host}`:`{database_port}`.
     */
    P1002: 'A timeout error occurred while connecting to the database server.',
    /**
     * Database `{database_file_name}` does not exist at `{database_file_path}`
     *
     * Database `{database_name}.{database_schema_name}` does not exist on the database server at `{database_host}:{database_port}`.
     *
     * Database `{database_name}` does not exist on the database server at `{database_host}:{database_port}`.
     */
    P1003: 'Database does not exist.',
    /**
     * Operations timed out after `{time}`
     */
    P1008: 'Database operation timed out.',
    /**
     * Database `{database_name}` already exists on the database server at `{database_host}:{database_port}`
     */
    P1009: 'Database already exists.',
    /**
     * User `{database_user}` was denied access on the database `{database_name}`
     */
    P1010: 'Access denied.',
    /**
     * Error opening a TLS connection: `{message}`
     */
    P1011: 'TLS connection error.',
    /**
     * `{full_error}`
     */
    P1012: 'Error',
    /**
     * The provided database string is invalid. `{details}`
     */
    P1013: 'Invalid database string.',
    /**
     * The underlying `{kind}` for model `{model}` does not exist.
     */
    P1014: 'Kind does not exist.',
    /**
     * Your Prisma schema is using features that are not supported for the version of the database. Database version: `{database_version}` Errors:
     */
    P1015: 'Unsupported Features At Prisma Schema',
    /**
     * Your raw query had an incorrect number of parameters. Expected: `{expected}`, actual: `{actual}`.
     */
    P1016: 'Raw query had incorrect number of parameters.',
    /**
     * Server has closed the connection.
     */
    P1017: 'Server has closed the connection.'
};
exports.QueryErrorDetails = {
    /**
     * The provided value for the column is too long for the column's type. Column: `{column_name}`
     */
    P2000: 'Value is too long for the column.',
    /**
     * The record searched for in the where condition (`{model_name}.{argument_name} = {argument_value}`) does not exist
     */
    P2001: 'The record searched for in the where condition does not exist.',
    /**
     * Unique constraint failed on the `{constraint}`
     */
    P2002: 'A duplicate of this field value was found.',
    /**
     * Foreign key constraint failed on the field: `{field_name}`
     */
    P2003: 'A foreign key constraint failed on the field.',
    /**
     * A constraint failed on the database: `{database_error}`
     */
    P2004: 'A constraint failed on the database.',
    /**
     * The value `{field_value}` stored in the database for the field `{field_name}` is invalid for the field's type
     */
    P2005: "The value stored in the database for the field is invalid for the field's type.",
    /**
     * The provided value `{field_value}` for `{model_name}` field `{field_name}` is not valid
     */
    P2006: 'The provided value for the field is not valid.',
    /**
     * Data validation error `{database_error}`
     */
    P2007: 'A data validation error occurred.',
    /**
     * Failed to parse the query `{query_parsing_error}` at `{query_position}`
     */
    P2008: 'Failed to parse the query.',
    /**
     * Failed to validate the query: `{query_validation_error}` at `{query_position}`
     */
    P2009: 'Failed to validate the query.',
    /**
     * Raw query failed. Code: `{code}`. Message: `{message}`
     */
    P2010: 'Raw query failed.',
    /**
     * Null constraint violation on the `{constraint}`
     */
    P2011: 'A null constraint violation occurred for the specified field.',
    /**
     * Missing a required value at `{path}`
     */
    P2012: 'A required value is missing.',
    /**
     * Missing the required argument `{argument_name}` for field `{field_name}` on `{object_name}`.
     */
    P2013: 'A required argument is missing.',
    /**
     * The change you are trying to make would violate the required relation '{relation_name}' between the `{model_a_name}` and `{model_b_name}` models.
     */
    P2014: 'The change you are trying to make would violate the required relation.',
    /**
     * A related record could not be found. `{details}`
     */
    P2015: 'A related record could not be found.',
    /**
     * Query interpretation error. `{details}`
     */
    P2016: 'Query interpretation error.',
    /**
     * The records for relation `{relation_name}` between the `{parent_name}` and `{child_name}` models are not connected.
     */
    P2017: 'The records for relation are not connected.',
    /**
     * The required connected records were not found. `{details}`
     */
    P2018: 'The required connected records were not found.',
    /**
     * Input error. `{details}`
     */
    P2019: 'Input error.',
    /**
     * Value out of range for the type. `{details}`
     */
    P2020: 'The value is out of range for the type.',
    /**
     * The table `{table}` does not exist in the current database.
     */
    P2021: 'The table does not exist in the current database.',
    /**
     * The column `{column}` does not exist in the current database.
     */
    P2022: 'The column does not exist in the current database.',
    /**
     * Inconsistent column data: `{message}`
     */
    P2023: 'A inconsistent column data occurred.',
    /**
     * Timed out fetching a new connection from the pool. Please consider reducing the number of requests or increasing the `connection_limit` parameter (https://www.prisma.io/docs/concepts/components/prisma-client/connection-management#connection-pool). Current limit: `{connection_limit}`.
     */
    P2024: 'Timed out fetching a new connection from the pool.',
    /**
     * An operation failed because it depends on one or more records that were required but not found. `{cause}`
     */
    P2025: 'An operation failed because it depends on one or more records that were required but not found.',
    /**
     * The current database provider doesn't support a feature that the query used: `{feature}`
     */
    P2026: "The current database provider doesn't support a feature that the query used.",
    /**
     * Multiple errors occurred on the database during query execution: `{errors}`
     */
    P2027: 'Multiple errors occurred on the database during query execution.'
};
exports.MigrationErrorDetails = {
    /**
     * Failed to create database: `{database_error}`
     */
    P3000: 'Failed to create database.',
    /**
     * Migration possible with destructive changes and possible data loss: `{migration_engine_destructive_details}`
     */
    P3001: 'Migration possible with destructive changes and possible data loss.',
    /**
     * The attempted migration was rolled back: `{database_error}`
     */
    P3002: 'The attempted migration was rolled back.',
    /**
     * The format of migrations changed, the saved migrations are no longer valid. To solve this problem, please follow the steps at: https://pris.ly/d/migrate
     */
    P3003: 'The format of migrations changed, the saved migrations are no longer valid. To solve this problem, please follow the steps at: https://pris.ly/d/migrate',
    /**
     * The `{database_name}` database is a system database, it should not be altered with prisma migrate. Please connect to another database.
     */
    P3004: 'The database is a system database, it should not be altered with prisma migrate. Please connect to another database.',
    /**
     * The database schema for `{database_name}` is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline
     */
    P3005: 'The database schema for the database is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline',
    /**
     * Migration `{migration_name}` failed to apply cleanly to a temporary database.
     */
    P3006: 'Migration failed to apply cleanly to a temporary database.',
    /**
     * Some of the requested preview features are not yet allowed in migration engine. Please remove them from your data model before using migrations.
     */
    P3007: 'Some of the requested preview features are not yet allowed in migration engine. Please remove them from your data model before using migrations.',
    /**
     * The migration `{migration_name}` is already recorded as applied in the database.
     */
    P3008: 'The migration is already recorded as applied in the database.',
    /**
     * migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve `{details}`
     */
    P3009: 'Migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve.',
    /**
     * The name of the migration is too long. It must not be longer than 200 characters (bytes).
     */
    P3010: 'Migration name is too long. It must not be longer than 200 characters (bytes).',
    /**
     * Migration `{migration_name}` cannot be rolled back because it was never applied to the database.
     */
    P3011: 'Migration cannot be rolled back because it was never applied to the database.',
    /**
     * Migration `{migration_name}` cannot be rolled back because it is not in a failed state.
     */
    P3012: 'The migration cannot be rolled back because it is not in a failed state.',
    /**
     * Datasource provider arrays are no longer supported in migrate. Please change your datasource to use a single provider. Read more at https://pris.ly/multi-provider-deprecation
     */
    P3013: 'The datasource provider arrays are no longer supported in migrate. Please change your datasource to use a single provider. Read more at https://pris.ly/multi-provider-deprecation',
    /**
     * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml. You will encounter errors when you try to apply migrations generated for a different provider. Please archive your current migration directory at a different location and start a new migration history with `prisma migrate dev`.
     */
    P3014: 'The datasource provider in the schema does not match the one specified in the migration_lock.toml. You will encounter errors when you try to apply migrations generated for a different provider. Please archive your current migration directory at a different location and start a new migration history with `prisma migrate dev`.',
    /**
     * Could not find the migration file at `{migration_file_path}`. Please delete the directory or restore the migration file.
     */
    P3015: 'Could not find the migration file with the specified migration file path. Please delete the directory or restore the migration file.',
    /**
     * The fallback method for database resets failed, meaning Migrate could not clean up the database entirely. Original error: `{error_code}`
     * `{inner_error}`
     */
    P3016: 'The fallback method for database resets failed, meaning Migrate could not clean up the database entirely.',
    /**
     * The migration `{migration_name}` could not be found. Please make sure that the migration exists, and that you included the whole name of the directory. (example: `"20201207184859_initial_migration"`)
     */
    P3017: 'The migration could not be found. Please make sure that the migration exists, and that you included the whole name of the directory. (example: `"20201207184859_initial_migration"`)',
    /**
     * A migration failed to apply. New migrations can not be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve
     *
     * Migration name: `{migration_name}`
     *
     * Database error code: `{database_error_code}`
     *
     * Database error:
     * `{database_error}`
     */
    P3018: 'A migration failed to apply. New migrations can not be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve',
    /**
     * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml, `{expected_provider}`. Please remove your current migration directory and start a new migration history with prisma migrate dev. Read more: https://pris.ly/d/migrate-provider-switch
     */
    P3019: 'The datasource provider in the schema does not match the one specified in the migration_lock.toml, `{expected_provider}`. Please remove your current migration directory and start a new migration history with prisma migrate dev. Read more: https://pris.ly/d/migrate-provider-switch',
    /**
     * The automatic creation of shadow databases is disabled on Azure SQL. Please set up a shadow database using the `shadowDatabaseUrl` datasource attribute.
     *
     * Read the docs page for more details: https://pris.ly/d/migrate-shadow
     */
    P3020: 'The automatic creation of shadow databases is disabled on Azure SQL. Please set up a shadow database using the `shadowDatabaseUrl` datasource attribute. Read the docs page for more details: https://pris.ly/d/migrate-shadow'
};
var MiscDetails = {
    UnhandledError: 'An unhandled or unknown error occurred.'
};
exports.PrismaErrorDetails = __assign(__assign(__assign(__assign({}, exports.CommonErrorDetails), exports.MigrationErrorDetails), exports.QueryErrorDetails), MiscDetails);
