import React from "react";
import '../Main.css';

class Pagination extends React.Component {
	constructor(props) {
	    super(props);
		
	    this.state = {
			page_index: 1,
		};
	}
	
	changePage = (index) => {
		this.props.changePage(index);
		this.setState({page_index : index});
	}

	render() {

		if (this.props.count <= 1)
			return <></>;
				
		let pages = [];

		if (this.props.count < 8) {
			for (let i = 1; i <= this.props.count; i++) 
				pages.push(i);
		} else {
			let right_ellipsis =  this.props.count - this.state.page_index > 3;	
			let left_ellipsis = this.state.page_index > 4;
			
			pages.push(1);
			pages.push(2);
			
			if (!left_ellipsis) {
				if (this.state.page_index >= 2)
					pages.push(3);
				
				if (this.state.page_index >= 3)
					pages.push(4);
				
				if (this.state.page_index >= 4)
					pages.push(5);
			} else {
				pages.push(-1);
			}
			
			if (left_ellipsis && right_ellipsis) {
				pages.push(this.state.page_index - 1);
				pages.push(this.state.page_index);
				pages.push(this.state.page_index + 1);
			}
			
			
			if (!right_ellipsis) {
				if (this.state.page_index <= this.props.count - 3)
					pages.push(this.props.count - 4);
				
				if (this.state.page_index <= this.props.count - 2)
					pages.push(this.props.count - 3);
				
				if (this.state.page_index <= this.props.count - 1)
					pages.push(this.props.count - 2);
			} else {
				pages.push(-2);
			}
			
			pages.push(this.props.count - 1);
			pages.push(this.props.count);
		}
		
		let page_list = pages.map(index => (index < 0)? <span key={index} className="text-3xl">...</span> : 
			<button key={index} className={"flex justify-center items-center text-3xl font-mono " 
				+ ((index === this.state.page_index)? "underline" : "")} onClick={() => {this.changePage(index);}}>{index}</button>);
			
		return <div className = "flex gap-2">{page_list}</div>
    }
}
export default Pagination;