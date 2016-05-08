'use strict'

describe('A demo test suite', () => {
  it('1.1.0 should pass', () => {
    expect(true).to.be.true
  })

  it('1.1.1 should fail', () => {
    expect(false).to.be.true
  })

  xit('1.1.2 should skip', () => {
    expect(true).to.be.true
  })

  describe('with an inner suite', () => {
    it('1.2.0 should (slowly) pass', (done) => {
      expect(true).to.be.true

      setTimeout(() => {
        expect(true).to.be.true
        done()
      }, 1000)
    })

    describe('with another inner suite', () => {
      it('1.3.0 should throw Error', () => {
        throw new TypeError('oh noes!')
      })
    })
  })
})
