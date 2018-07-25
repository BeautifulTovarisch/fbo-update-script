'use strict';

const Promise = require( 'bluebird' );
const tedious = require( 'tedious' );

const TYPES = tedious.TYPES;

const connectionString = require( './db.config.json' ).DevDatabase;

const BULK_INSERT = filePath =>
    Promise.try( () => {
	const connection = new tedious.Connection( connectionString );
	const request = new tedious.Request( 'dbo.BULK_IMPORT_CSV', err => {
	    return err
		? Promise.reject( err )
		: Promise.resolve();
	});

	request.addParameter( 'filePath', TYPES.NVarChar, filePath );
	request.addParameter( 'tableName', TYPES.NVarChar, 'Data' );
	request.addParameter( 'schemaName', TYPES.NVarChar, 'Fbo' );
	request.addParameter( 'rowTerminator', TYPES.NVarChar, '\0z' );
	request.addParameter( 'fieldTerminator', TYPES.NVarChar, '\0' );

	connection.on( 'connect', err => err ? ( connection.close() && Promise.reject( err ) ) : connection.callProcedure( request ) );
    });

module.exports = BULK_INSERT;
