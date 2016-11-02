var React = require('react');

var {joinPath} = require('../../misc.js');

var NavBar = React.createClass({
    render: function() {
        let {nav} = this.props;
        return (
            <section className='row'>
                <form>
                    <input className='small'
                        onClick={() => this.props.logout()}
                        type='button' value='Logout'
                    />
                    <input className='small'
                        onClick={() => this.props.fetchDirection('refresh')}
                        type='button' value='Refresh'
                    />
                    <input disabled={nav.path.length === 0} className='small'
                        onClick={() => this.props.fetchDirection('previous')}
                        type='button' value='Back'
                    />
                    {/*
                    <input
                        value={}
                    />
                    */}
                </form>
                <ul className='horizontal'>
                    <li>
                    </li>
                    <li>
                    </li>
                    <li>
                    </li>
                    <li>directory: {joinPath(nav.path)}</li>
                </ul>
            </section>
        );
    }
});

module.exports = NavBar;
