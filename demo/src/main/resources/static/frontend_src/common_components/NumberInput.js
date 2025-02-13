import React from "react";
import '../Main.css';

class NumberInput extends React.Component {
	
	plusOne = () => {
		let elem = document.getElementById(`input-${this.props.name}`);
		elem.value = Number(elem.value) + 1;
	}
	
	minusOne = () => {
		let elem = document.getElementById(`input-${this.props.name}`);
		elem.value = Number(elem.value) - 1;
	}
	
	render() {
		return <div className = "flex items-center gap-4">
			<div className="flex">
				<button type="button" onClick = {this.minusOne}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8" viewBox="0 0 16 16">
					   <path d="M4 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1z"></path>
					</svg>
				</button>
				<input id={`input-${this.props.name}`} className="bg-gray-200 dark:bg-gray-800 max-w-8 text-center text-xl"
					 name={this.props.name} type="number" defaultValue={this.props.value}>
				</input>
				<button type="button" onClick = {this.plusOne}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8" viewBox="0 0 16 16">
					  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
					</svg>
				</button>
			</div>
			<span>{this.props.text}</span>
		</div>;
    }
}
export default NumberInput;