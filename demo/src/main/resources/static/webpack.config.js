const path = require("path");

module.exports = {
	entry: "./frontend_src/App.js",
	mode: "development",
	output: {
		path: path.resolve(__dirname, '.'),
    	filename: "App.js"
  	},
  	devServer: {
	    port: 9000
	},
  
    module: {
    	rules: [
	    	{
	        	test: /\.m?js$/,
	        	exclude: /node_modules/,
	        	use: {
	          		loader: "babel-loader"
	        	}
	        	
	    	},
			
			{	
				test: /\.txt$/, 
				loader: "text-loader" 
			},
			
			{
				test: /\.css$/,
			    use: [
			    	"style-loader",
			        {
			           loader: "css-loader",
			           options: {
			             modules: true
			           }
			        }
			    ]
			}
        ]
    }
};