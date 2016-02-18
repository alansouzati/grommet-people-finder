// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Rest from 'grommet/utils/Rest';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Button from 'grommet/components/Button';
import Logo from './Logo';
import Map from './Map';
import config from '../config';

export default class LocationComponent extends Component {

  constructor () {
    super();
    this._onLocationResponse = this._onLocationResponse.bind(this);
    this.state = {location: {}, scope: config.scopes.locations};
  }

  componentDidMount () {
    this._getLocation(this.props.id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.id !== this.props.id) {
      this._getLocation(nextProps.id);
    }
  }

  _onLocationResponse (err, res) {
    if (err) {
      this.setState({location: {}, error: err});
    } else if (res.ok) {
      const result = res.body;
      this.setState({location: result[0], error: null});
    }
  }

  _getLocation (id) {
    const params = {
      url: encodeURIComponent(config.ldap_base_url),
      base: encodeURIComponent(`ou=${this.state.scope.ou},o=${config.organization}`),
      scope: 'sub',
      filter: `(hpRealEstateID=${id})`
    };
    Rest.get('/ldap/', params).end(this._onLocationResponse);
  }

  render () {
    const appTitle = (
      <FormattedMessage id="Locations Finder" defaultMessage="Locations Finder" />
    );
    const loc = this.state.location;
    let address;
    if (loc.postalAddress) {
      address = loc.postalAddress.split(/ \$ /).map((e, index) =>
        (<div key={index}>{e}</div>));
    }

    // NOTE: ED latitude and longitude aren't accurate. Removed the following from Map use:
    // latitude={loc.latitude} longitude={loc.longitude}

    return (
      <Article>
        <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <Logo />
            {appTitle}
          </Title>
          <Button icon="Search" onClick={this.props.onClose} />
        </Header>
        <Section pad="medium">
          <Header tag="h1" justify="between">
            <span>{loc.buildingName}</span>
            <span className="secondary">{loc.hpRealEstateID}</span>
          </Header>
          <address>{address}</address>
          <h3><a href={"tel:" + loc.telephoneNumber}>{loc.telephoneNumber}</a></h3>
          <p>{loc.businessCategory}</p>
        </Section>
        <Map title={loc.businessCategory || loc.buildingName}
          street={loc.street} city={loc.l} state={loc.st} country={loc.c} />
      </Article>
    );
  }

};

LocationComponent.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};
