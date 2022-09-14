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
exports.PrismaErrorCategory = exports.MigrationError = exports.QueryError = exports.CommonError = void 0;
exports.CommonError = {
    /**
     * Authentication failed against database server at `{database_host}`, the provided database credentials for `{database_user}` are not valid. Please make sure to provide valid database credentials for the database server at `{database_host}`.
     */
    P1000: 'AuthenticationFailed',
    /**
     * Can't reach database server at `{database_host}`:`{database_port}` Please make sure your database server is running at `{database_host}`:`{database_port}`.
     */
    P1001: 'CouldNotConnectToDatabase',
    /**
     * The database server at `{database_host}`:`{database_port}` was reached but timed out. Please try again. Please make sure your database server is running at `{database_host}`:`{database_port}`.
     */
    P1002: 'ConnectionTimedOut',
    /**
     * Database `{database_file_name}` does not exist at `{database_file_path}`
     *
     * Database `{database_name}.{database_schema_name}` does not exist on the database server at `{database_host}:{database_port}`.
     *
     * Database `{database_name}` does not exist on the database server at `{database_host}:{database_port}`.
     */
    P1003: 'DatabaseFileNotFound',
    /**
     * Operations timed out after `{time}`
     */
    P1008: 'OperationsTimedOut',
    /**
     * Database `{database_name}` already exists on the database server at `{database_host}:{database_port}`
     */
    P1009: 'DatabaseAlreadyExists',
    /**
     * User `{database_user}` was denied access on the database `{database_name}`
     */
    P1010: 'AccessDeniedForUser',
    /**
     * Error opening a TLS connection: `{message}`
     */
    P1011: 'TLSConnectionError',
    /**
     * `{full_error}`
     */
    P1012: 'Error',
    /**
     * The provided database string is invalid. `{details}`
     */
    P1013: 'InvalidDatabaseString',
    /**
     * The underlying `{kind}` for model `{model}` does not exist.
     */
    P1014: 'KindForModelDoesNotExist',
    /**
     * Your Prisma schema is using features that are not supported for the version of the database. Database version: `{database_version}` Errors:
     */
    P1015: 'UnsupportedFeaturesAtPrismaSchema',
    /**
     * Your raw query had an incorrect number of parameters. Expected: `{expected}`, actual: `{actual}`.
     */
    P1016: 'IncorrectNumberOfParameters',
    /**
     * Server has closed the connection.
     */
    P1017: 'ServerClosedConnection'
};
exports.QueryError = {
    /**
     * The provided value for the column is too long for the column's type. Column: `{column_name}`
     */
    P2000: 'ValueTooLongForColumnType',
    /**
     * The record searched for in the where condition (`{model_name}.{argument_name} = {argument_value}`) does not exist
     */
    P2001: 'RecordDoesNotExist',
    /**
     * Unique constraint failed on the `{constraint}`
     */
    P2002: 'UniqueConstraintViolation',
    /**
     * Foreign key constraint failed on the field: `{field_name}`
     */
    P2003: 'ForeignConstraintViolation',
    /**
     * A constraint failed on the database: `{database_error}`
     */
    P2004: 'ContraintViolation',
    /**
     * The value `{field_value}` stored in the database for the field `{field_name}` is invalid for the field's type
     */
    P2005: 'InvalidValueForFieldType',
    /**
     * The provided value `{field_value}` for `{model_name}` field `{field_name}` is not valid
     */
    P2006: 'InvalidValue',
    /**
     * Data validation error `{database_error}`
     */
    P2007: 'ValidationError',
    /**
     * Failed to parse the query `{query_parsing_error}` at `{query_position}`
     */
    P2008: 'QueryParsingError',
    /**
     * Failed to validate the query: `{query_validation_error}` at `{query_position}`
     */
    P2009: 'QueryValidationError',
    /**
     * Raw query failed. Code: `{code}`. Message: `{message}`
     */
    P2010: 'RawQueryError',
    /**
     * Null constraint violation on the `{constraint}`
     */
    P2011: 'NullConstraintViolation',
    /**
     * Missing a required value at `{path}`
     */
    P2012: 'MissingRequiredValue',
    /**
     * Missing the required argument `{argument_name}` for field `{field_name}` on `{object_name}`.
     */
    P2013: 'MissingRequiredArgument',
    /**
     * The change you are trying to make would violate the required relation '{relation_name}' between the `{model_a_name}` and `{model_b_name}` models.
     */
    P2014: 'RequiredRelationViolation',
    /**
     * A related record could not be found. `{details}`
     */
    P2015: 'RelatedRecordNotFound',
    /**
     * Query interpretation error. `{details}`
     */
    P2016: 'InterpretationError',
    /**
     * The records for relation `{relation_name}` between the `{parent_name}` and `{child_name}` models are not connected.
     */
    P2017: 'RecordsForParentAndChildNotConnected',
    /**
     * The required connected records were not found. `{details}`
     */
    P2018: 'RequiredConnectedRecordsNotFound',
    /**
     * Input error. `{details}`
     */
    P2019: 'InputError',
    /**
     * Value out of range for the type. `{details}`
     */
    P2020: 'ValueOutOfRange',
    /**
     * The table `{table}` does not exist in the current database.
     */
    P2021: 'TableDoesNotExist',
    /**
     * The column `{column}` does not exist in the current database.
     */
    P2022: 'ColumnDoesNotExist',
    /**
     * Inconsistent column data: `{message}`
     */
    P2023: 'InconsistentColumnData',
    /**
     * Timed out fetching a new connection from the pool. Please consider reducing the number of requests or increasing the `connection_limit` parameter (https://www.prisma.io/docs/concepts/components/prisma-client/connection-management#connection-pool). Current limit: `{connection_limit}`.
     */
    P2024: 'TimedOutFetchingConnectionFromThePool',
    /**
     * An operation failed because it depends on one or more records that were required but not found. `{cause}`
     */
    P2025: 'RecordsNotFound',
    /**
     * The current database provider doesn't support a feature that the query used: `{feature}`
     */
    P2026: 'UnsupportedProviderFeature',
    /**
     * Multiple errors occurred on the database during query execution: `{errors}`
     */
    P2027: 'MultipleErrors'
};
exports.MigrationError = {
    /**
     * Failed to create database: `{database_error}`
     */
    P3000: 'FailedToCreateDatabase',
    /**
     * Migration possible with destructive changes and possible data loss: `{migration_engine_destructive_details}`
     */
    P3001: 'PossibleDestructiveOrDataLossChanges',
    /**
     * The attempted migration was rolled back: `{database_error}`
     */
    P3002: 'MigrationRolledBack',
    /**
     * The format of migrations changed, the saved migrations are no longer valid. To solve this problem, please follow the steps at: https://pris.ly/d/migrate
     */
    P3003: 'InvalidMigrationFormat',
    /**
     * The `{database_name}` database is a system database, it should not be altered with prisma migrate. Please connect to another database.
     */
    P3004: 'SystemDatabaseNotSupported',
    /**
     * The database schema for `{database_name}` is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline
     */
    P3005: 'DatabaseNotEmpty',
    /**
     * Migration `{migration_name}` failed to apply cleanly to a temporary database.
     */
    P3006: 'CouldNotApplyCleanlyToTemporaryDatabase',
    /**
     * Some of the requested preview features are not yet allowed in migration engine. Please remove them from your data model before using migrations.
     */
    P3007: 'PreviewFeaturesNotAllowedInMigrationEngine',
    /**
     * The migration `{migration_name}` is already recorded as applied in the database.
     */
    P3008: 'MigrationAlreadyApplied',
    /**
     * migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve `{details}`
     */
    P3009: 'FailedMigrationsFound',
    /**
     * The name of the migration is too long. It must not be longer than 200 characters (bytes).
     */
    P3010: 'MigrationNameTooLong',
    /**
     * Migration `{migration_name}` cannot be rolled back because it was never applied to the database.
     */
    P3011: 'CannotRollBackANeverAppliedMigration',
    /**
     * Migration `{migration_name}` cannot be rolled back because it is not in a failed state.
     */
    P3012: 'CannotRollBackANotFailedMigration',
    /**
     * Datasource provider arrays are no longer supported in migrate. Please change your datasource to use a single provider. Read more at https://pris.ly/multi-provider-deprecation
     */
    P3013: 'DatasourceProviderArraysNotSupported',
    /**
     * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml. You will encounter errors when you try to apply migrations generated for a different provider. Please archive your current migration directory at a different location and start a new migration history with `prisma migrate dev`.
     */
    P3014: 'DatasourceProviderDontMatchMigrationLock',
    /**
     * Could not find the migration file at `{migration_file_path}`. Please delete the directory or restore the migration file.
     */
    P3015: 'MissingMigrationFile',
    /**
     * The fallback method for database resets failed, meaning Migrate could not clean up the database entirely. Original error: `{error_code}`
     * `{inner_error}`
     */
    P3016: 'CouldNotCleanupDatabase',
    /**
     * The migration `{migration_name}` could not be found. Please make sure that the migration exists, and that you included the whole name of the directory. (example: `"20201207184859_initial_migration"`)
     */
    P3017: 'MigrationNotFound',
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
    P3018: 'FailedToApplyMigration',
    /**
     * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml, `{expected_provider}`. Please remove your current migration directory and start a new migration history with prisma migrate dev. Read more: https://pris.ly/d/migrate-provider-switch
     */
    P3019: 'DatasourceProvidersDontMatch',
    /**
     * The automatic creation of shadow databases is disabled on Azure SQL. Please set up a shadow database using the `shadowDatabaseUrl` datasource attribute.
     *
     * Read the docs page for more details: https://pris.ly/d/migrate-shadow
     */
    P3020: 'ShadowDatabasesAutomaticCreationIsDisabled'
};
var Misc = {
    UnhandledError: 'UnhandledError'
};
exports.PrismaErrorCategory = __assign(__assign(__assign(__assign({}, exports.CommonError), exports.MigrationError), exports.QueryError), Misc);
