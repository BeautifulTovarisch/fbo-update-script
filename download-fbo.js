'use strict';

const fs = require( 'fs' );
const fcsv = require( 'fast-csv' );
const Client = require( 'ftp' );
const csvWriter = require( 'csv-write-stream' );

const c = new Client();

const fboFile = "/FBORecovery/FBORecovery20180707.csv";

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

		const writer = csvWriter( { separator: '\0' } );
		writer.pipe( fs.createWriteStream( latestRecord.name ) );

		stream.once( 'close', () => c.end() );
		stream
		    .pipe( csvStream )
		    .pipe( writer )
		    .on( 'end', () => console.log( "Wrote file", latestRecord.name ) )
		    .on( 'error', err => console.log( err ) );

	    });
	});
    });
});

c.connect( options );
