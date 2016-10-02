var React = require('react');

var {joinPath} = require('../../misc.js');

var NavBar = React.createClass({
    render: function() {
        let {nav} = this.props;
        return (
            <section className='row'>
                <ul className='horizontal'>
                    <li><input onClick={() => this.props.fetchDirection('refresh')} type='button' value='refresh' /></li>
                    <li><input disabled={nav.path.length === 0} onClick={() => this.props.fetchDirection('previous')} type='button' value='Back' /></li>
                    <li>directory: {joinPath(nav.path)}</li>
                </ul>
            </section>
        )
    }
});

module.exports = NavBar;
