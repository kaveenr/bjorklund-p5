/**
 * Paper: http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf
*/

const EUCLID = (m, k, l = []) => k == 0 ? l : EUCLID(k, m % k, [...l, 0]);
const E = (k,n) => EUCLID(n - k, k);


function bjorklund(k,n) {
  
  let trigs = k, blanks = n - k, res = [];
  for (let i = 0; i < trigs; i++) res.push("x");
  for (let i = 0; i < blanks; i++) res.push(".");
  
  function _distribute(res) {
    let parts = new Set(res).keys();
    let ad = parts.next().value;
    let bd = parts.next().value;
    let ac = res.filter(x => x == ad).length;
    let bc = res.filter(x => x == bd).length;
    if (bc <= 1) return res;
    let nres = []
    while(ac > 0 || bc > 0) {
      if (ac > 0 && bc > 0){
        nres.push(ad+bd);
        ac--; bc--;
      } else if (ac > 0 && bc <= 0){
        nres.push(ad);
        ac--;
      } else {
        nres.push(bd);
        bc--;
      }
    }
    return _distribute(nres);
  }
  
  return _distribute(res).join("");
}

function patternRotate(_patt, direction, n) {
  let patt = _patt.split("");
  for (let i = 0; i < n; i ++) {
    if (direction) {
      patt.unshift(patt.pop());
    } else {
      patt.push(patt.shift());
    }
  }
  return patt.join("");
}

class EuclideanSequence {
  constructor(k,n, rotProbability = 0.1) {
    this.step = 0;
    this.k = k;
    this.n = n;
    this.seq = bjorklund(k,n);
    this.rotProbability = rotProbability;
  }
  update(k,n) {
    if (this.k == k && this.n == n) return;
    this.k = k;
    this.n = n;
    this.seq = bjorklund(k,n);
    this.step = 0;
  }
  rotate(direc) {
    this.seq = patternRotate(this.seq, direc, 1);
  }
  advance() {
    if (this.doRotate()) {
      this.rotate(this.doRotate());
    }
    if (this.step >= this.n) this.step = 0;
    let val = this.seq[this.step] == 'x'
    this.step++;
    return val;
  }
  isActive(n) {
    return this.seq[n] == 'x';
  }
  doRotate() {
    return this.rotProbability > random(0,1);
  }
}