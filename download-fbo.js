'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const fcsv = require( 'fast-csv' );
const Client = require( 'ftp' );
const csvWriter = require( 'csv-write-stream' );

const parseXML = require( './process-fbo' ).parseXML;
const parseJSON = require( './process-fbo' ).parseJSON;

const c = new Client();

const options = {
    host: "ftp.fbo.gov"
};

const today = new Date();

today.setDate( today.getDate() - 1 );

const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
const month = today.getMonth() < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
const year = today.getFullYear();

const dateString = `${year}${month}${day}`;

const fileName = `FBOFeed${dateString}`;

c.on( 'ready', () => {
    c.get( fileName, ( err, stream ) => {

	if( err ) {
	    c.end();
	    return console.log( err, fileName );
	}

	const writeStream = fs.createWriteStream( path.resolve( __dirname, `data/${fileName}.xml` ) );

	writeStream
	    .on( 'error', e => console.log( e ) );

	return stream
	    .pipe( writeStream )
	    .on( 'error', e => console.log( "Error: ", e ) )
	    .once( 'close', () => {
		c.end();
		parseXML( `data/${fileName}.xml` );
		parseJSON( `data/${fileName}.json` );
	    });
    });
});

c.connect( options );
