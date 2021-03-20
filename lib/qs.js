import assoc from 'ramda/es/assoc';
import dissoc from 'ramda/es/dissoc';
import has from 'ramda/es/has';
import compose from 'ramda/es/compose';
import map from 'ramda/es/map';
import over from 'ramda/es/over';
import lensProp from 'ramda/es/lensProp';
import propSatisfies from 'ramda/es/propSatisfies';
import pathOr from 'ramda/es/pathOr';
import fromPairs from 'ramda/es/fromPairs';
import split from 'ramda/es/split';
import last from 'ramda/es/last';
import is from 'ramda/es/is';
import concat from 'ramda/es/concat';
import without from 'ramda/es/without';
import join from 'ramda/es/join';
import toPairs from 'ramda/es/toPairs';
import ifElse from 'ramda/es/ifElse';
import isEmpty from 'ramda/es/isEmpty';
import identity from 'ramda/es/identity';
import isNil from 'ramda/es/isNil';


export const qs = (effectCallback = identity, testQueryString = null) => ({

  queryString: window.location.search,

  add(_key, _value) {
    return effectCallback(
      compose(
        this.stringify,
        this._add(_key, _value),
        this.parse
      )(isNil(testQueryString) ? this.queryString : testQueryString)
    );
  },

  drop(_key, _value) {
    return effectCallback(
      compose(
        this.stringify,
        this._drop(_key, _value),
        this.parse
      )(isNil(testQueryString) ? this.queryString : testQueryString)
    );
  },

  set(_key, _value) {
    return effectCallback(
      compose(
        this.stringify,
        this._set(_key, _value),
        this.parse
      )(isNil(testQueryString) ? this.queryString : testQueryString)
    );
  },

  getKey(_key) {
    return compose(
      this._getKey(_key),
      this.parse
    )(isNil(testQueryString) ? this.queryString : testQueryString);
  },

  _add(_key, _value) { 
    return ifElse(
      has(_key),
      over(lensProp(_key), concat(`${encodeURIComponent(_value)},`)),
      assoc(_key, encodeURIComponent(_value))
    );
  },

  _drop(_key, _value) {
    return compose(
      ifElse(
        propSatisfies(isEmpty, _key), 
        dissoc(_key), 
        identity
      ),
      over(lensProp(_key),
        ifElse(
          is(Object),
          without([_value]),
          compose(
            ifElse(
              isEmpty,
              identity,
              compose(
                join(','),
                map(
                  encodeURIComponent
                )
              )
            ),
            without([_value]),
            split(','),
            decodeURIComponent
          )
        )
      )
    );
  },

  _set(_key, _value) {
    return ifElse(
      () => !_value,
      dissoc(_key),
      assoc(_key, encodeURIComponent(_value))
    );
  },

  _getKey(_key) {
    return compose(
      decodeURIComponent,
      pathOr('', [_key])
    );
  },

  parse: ifElse(
    isEmpty,
    () => ({}),
    compose(
      fromPairs, 
      map(
        split('=')
      ),
      split('&'),
      last,
      split('?')
    )
  ),

  stringify: ifElse(
    isEmpty,
    () => '',
    compose(
      concat('?'),
      join('&'),
      map(
        join('=')
      ),
      toPairs
    )
  )
  
});
