'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );
const stream = require( 'stream' );

const _ = require( 'lodash' );
const csvWriter = require( 'csv-write-stream' );
const JSONStream = require( 'JSONStream' );

const parser = require( './fbo-parser/index' );

const Transform = stream.Transform;

const Extract = function( options ) {
    return Transform.call( this, options );
};

Extract.prototype._transform = function( chunk, encoding, callback ) {
    const type = _.first( _.keys( chunk[ 0 ] ) );
    const record = chunk[ 0 ];

    console.log( record );
    this.push( JSON.strinrecord );
};

const parseXML = file =>
      fs.writeFileSync(
	  file.replace( /.xml/, '.json' ),
	  JSON.stringify( parser.parse( fs.readFileSync( file, 'UTF-8' ) ) ) );


const parseJSON = file => {
    const writer = csvWriter({
	headers: [
	    "DATE",
	    "YEAR",
	    "AGENCY",
	    "OFFICE",
	    "LOCATION",
	    "CLASSCOD",
	    "NAICS",
	    "OFFADD",
	    "SUBJECT",
	    "SOLNBR",
	    "RESPDATE",
	    "CONTACT",
	    "LINK",
	    "URL",
	    "DESC2",
	    "SETASIDE",
	    "POPCOUNTRY",
	    "POPZIP",
	    "POPADDRESS"
	]
    });

    const csvStream = fs.createWriteStream( file.replace( /.json/, '.csv' ) );
    const dataStream = fs.createReadStream( file );
    const jsonStream = JSONStream.parse( '*' );



    jsonStream.on( 'data', d => {
	const type = _.first( _.keys( _.first( d ) ) );
	const data = d[ 0 ][ type ];

	writer.write( data );

    });

    writer.pipe( csvStream );

    dataStream
	.pipe( jsonStream );
	// .pipe( writer )
	// .pipe( csvStream );

};

module.exports = {
    parseXML: parseXML,
    parseJSON: parseJSON
};
