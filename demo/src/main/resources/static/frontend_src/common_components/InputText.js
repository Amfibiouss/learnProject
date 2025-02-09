import React from "react";
import '../Main.css';

class InputText extends React.Component {

	render() {
		return <input className="border-2 border-black bg-gray-100 dark:bg-gray-500" name={this.props.name} type={this.props.type}></input>
    }
}
export default InputText;