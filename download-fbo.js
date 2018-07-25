'use strict';

const path = require( 'path' );

const fs = require( 'fs' );
const fcsv = require( 'fast-csv' );
const Client = require( 'ftp' );
const csvWriter = require( 'csv-write-stream' );

const bulkInsert = require( './database' );

const c = new Client();

const options = {
    host: "ftp.fbo.gov"
};

const maxDate = ( a, b ) => new Date( a.date ) > new Date( b.date ) ? a : b;

c.on( 'ready', () => {
    c.cwd( "FBORecovery", ( err, currentDir ) => {
	c.list( ( err, list ) => {
	    if( err )
		throw err;

	    const latestRecord = list.reduce( maxDate );

	    c.get( latestRecord.name, ( err, stream ) => {
		if( err )
		    throw err;

		const csvStream = fcsv.parse({
		    quote: '"',
		    headers: true,
		    delimiter: ","
		});

		// Verify that each record has a Solicitaton Number
		csvStream
		    .validate( data => data["Sol #"] )
		    .on( "data-invalid", () => "\n" );

		const writer = csvWriter( { separator: '\0', newline: "\0z" } );
		writer.pipe( fs.createWriteStream( latestRecord.name ) );

		stream.once( 'close', () => c.end() );
		stream
		    .pipe( csvStream )
		    .pipe( writer )
		    .on( 'end', () => bulkInsert( path.resolve( latestRecord.name ) ) )
		    .on( 'error', err => console.log( err ) );

	    });
	});
    });
});

c.connect( options );
