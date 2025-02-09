import React from "react";
import '../Main.css';

class Button extends React.Component {

	render() {
		return <button className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 border-2 border-black rounded-xl whitespace-nowrap transition-colors duration-300" 
		style={{padding: "0.25rem 1.5rem"}} 
		onClick={this.props.onClick}>{this.props.value}</button>
    }
}
export default Button;