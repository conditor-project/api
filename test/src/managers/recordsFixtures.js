'use strict';

module.exports = [
  {
    idConditor     : 'a',
    sourceUid      : 'wos$1',
    source         : 'wos',
    isDuplicate    : true,
    isNearDuplicate: true,
    idChain        : '!pubmed:e!wos:a!wos:b!',
    duplicates     : [
      {
        source    : 'wos',
        idConditor: 'b'
      },
      {
        source    : 'pubmed',
        idConditor: 'e'
      }
    ],
    nearDuplicates : [
      {
        source    : 'hal',
        idConditor: 'c'
      }
    ]
  },
  {
    idConditor     : 'b',
    sourceUid      : 'wos$2',
    source         : 'wos',
    isDuplicate    : true,
    isNearDuplicate: true,
    idChain        : '!pubmed:e!wos:a!wos:b!',
    duplicates     : [
      {
        source    : 'wos',
        idConditor: 'a'
      },
      {
        source    : 'pubmed',
        idConditor: 'e'
      }
    ],
    nearDuplicates : [
      {
        idConditor: 'c'
      },
      {
        idConditor: 'h'
      }
    ]
  },
  {
    idConditor     : 'c',
    sourceUid      : 'hal$1',
    source         : 'hal',
    isDuplicate    : false,
    isNearDuplicate: true,
    idChain        : '!hal:c!pubmed:x!',
    duplicates     : [
      {
        idConditor: 'x',
        source    : 'pubmed'
      }
    ],
    nearDuplicates : [
      {
        idConditor: 'a'
      },
      {
        idConditor: 'b'
      }
    ]
  },
  {
    idConditor     : 'd',
    sourceUid      : 'hal$2',
    isDuplicate    : true,
    isNearDuplicate: false,
    idChain        : '!hal:d!pubmed:z!',
    duplicates     : [
      {
        source    : 'pubmed',
        idConditor: 'z'
      }
    ]
  },
  {
    idConditor     : 'e',
    sourceUid      : 'pubmed$1',
    isDuplicate    : true,
    isNearDuplicate: false,
    idChain        : '!pubmed:e!wos:a!wos:b!',
    duplicates     : [
      {
        source    : 'wos',
        idConditor: 'a'
      }, {
        source    : 'wos',
        idConditor: 'b'
      }
    ]
  },
  {
    idConditor     : 'x',
    sourceUid      : 'pubmed$2',
    isDuplicate    : true,
    isNearDuplicate: false,
    idChain        : '!hal:c!pubmed:x!',
    duplicates     : [
      {
        source    : 'hal',
        idConditor: 'c'
      }
    ]
  }
];
