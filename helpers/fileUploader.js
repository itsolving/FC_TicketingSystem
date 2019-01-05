let mkdirp = require('mkdirp');

module.exports = async function upload(files, url){
	console.log("Upload started")
	let time     = new Date(),
	    dirTime  = time.getTime(),
	    dirStr   =  Math.random()
	    				.toString(36)
	    				.slice(2, 2 + Math.max(1, Math.min(15, 25)) ),
	    finalDir = `${dirTime}${dirStr}`;



	let pageFile = files.page;
	let assetsFiles = files.assets;
	await mkdirp(`${__dirname}${url}/assets`, async (err) => { 
		if ( err ) console.log(`Trying to create dir after save, but dir already exist!`)
			await pageFile.mv(`${__dirname}${url}/${pageFile.name}`, function(err) {
		    if (err){
		    	console.log(err);
		    	return false;
		    }
		        
		});

		await assetsFiles.forEach(function(item, i, arr) {
			item.mv(`${__dirname}${url}/assets/${item.name}`, function(err) {
				if (err){
			    	console.log(err);
			    	return false;
			    }
			})
		});
	});

	return true;
}