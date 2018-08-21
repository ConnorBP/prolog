
studio . setResource (['prolog', 'studio'],
function (root, directory) {
  var list = new function () {
    this . code = function (el) {
      if (el . type === 0) {root . log (root . list () . join (' ')); return true;}
      if (el . type === 2) {
        el . type = 0;
        var l = root . list ();
        for (var ind in l) el = el . setNativePair (l [ind]);
        return true;
      }
      if (el . type === 1) {
        var first = el . left;
        if (first . type === 2) {first . setNative (root . list () . join (' ')); return true;}
        el = el . right;
        if (first . type === 3) {
          if (el . type === 0) {root . log (root . listAtom (first . left) . join ('\n')); return true;}
          if (el . type === 2) {
            el . type = 0;
            var clause = first . left . firstClause;
            while (clause !== null) {
              el . setPair ();
              clause . duplicate (el . left); el . left . left . left . setAtom (first . left);
              el = el . right;
              clause = clause . left . left . left;
            }
            return true;
          }
          if (el . type === 1) {el . left . setNative (root . listAtom (first . left) . join ('\n') + '\n'); return true;}
        }
        if (first . type === 6) {
          first = first . left;
          if (typeof (first) !== 'string') return false;
          if (el . type === 2) {
            el . type = 0;
            var directory = root . searchDirectory (first);
            if (directory === null) return false;
            var atom = directory . firstAtom;
            while (atom !== null) {el . setPair (); el . left . setAtom (atom); el = el . right; atom = atom . next;}
            return true;
          }
          var listing = root . list (first);
          if (listing === null) return false;
          if (el . type === 0) {root . log (listing . join (' ')); return true;}
          if (el . type === 1) {el . left . setNative (listing . join (' ')); return true;}
        }
      }
      return false;
    };
  };
  var pp = new function () {
    this . code = function (el) {
      var out = '';
      while (el . type === 1) {out += root . getValue (el . left); el = el . right;}
      console . log (out);
      return true;
    };
  };
  var sum = new function () {
    this . code = function (el) {
      if (! el . type === 1) return false;
      var e1 = el . left; el = el . right; if (! el . type === 1) return false;
      var e2 = el . left; el = el . right;
      var e3 = el . type === 1 ? el . left : el;
      if (e1 . type === 6) {
        if (e2 . type === 6) {e3 . setNative (e1 . left + e2 . left); return true;}
        if (e2 . type === 3) {e3 . setNative (e1 . left + e2 . left . name); return true;}
      }
      if (e1 . type === 3) {
        if (e2 . type === 6) {e3 . setNative (e1 . left . name + e2 . left); return true;}
        if (e2 . type === 3) {e3 . setNative (e1 . left . name + e2 . left . name); return true;}
      }
      if (e3 . type === 6) {
        if (e2 . type === 6) {e1 . setNative (Number (e3 . left) - Number (e2 . left)); return true;}
        if (e1 . type === 6) {e2 . setNative (Number (e3 . left) - Number (e1 . left)); return true;}
      }
      return false;
    };
  };
  var add = new function () {
    this . code = function (el) {
      if (! el . type === 1) return false;
      var result = null, sum = 0;
      if (el . left . type === 2) {result = el . left; el = el . right;}
      switch (el . left . type) {
        case 6: sum = el . left . left; el = el . right; break;
        case 3: sum = el . left . left . name; el = el . right; break;
        default: break;
      }
      while (el . type === 1) {
        switch (el . left . type) {
          case 6: sum += el . left . left; break;
          case 1:
            var sub = 1, ell = el . left;
            while (ell . type === 1) {sub *= Number (ell . left . left); ell = ell . right;}
            sum += sub;
            break;
          case 3: sum += el . left . left . name; break;
          case 2: el . left . setNative (sum); break;
          default: break;
        }
        el = el . right;
      }
      if (result === null) return true;
      result . setNative (sum === null ? 0 : sum); return true;
    };
  };
  var mult = new function () {
    this . code = function (el) {
      if (! el . type === 1) return false;
      var result = null, ret = 1;
      if (el . left . type === 2) {result = el . left; el = el . right;}
      while (el . type === 1) {
        switch (el . left . type) {
          case 6: ret *= el . left . left; break;
          case 2: el . left . setNative (ret); break;
          default: break;
        }
        el = el . right;
      }
      if (result === null) return true;
      result . setNative (ret); return true;
    };
  };
  var addd = function (delta) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var left = el . left, ret = NaN;
      switch (left . type) {
        case 6: ret = left . left + delta; break;
        case 3: ret = left . left . name + delta; break;
        default: break;
      }
      el = el . right; if (el . type === 1) el = el . left;
      el . setNative (ret); return true;
    };
  };
  var add1 = new addd (1), sub1 = new addd (-1);
  var zero_param = function (value) {
    this . code = function (el) {if (el . type === 1) el = el . left; el . setNative (value); return true;};
  };
  var one_param = function (f, rev) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var a = el . left; el = el . right; if (el . type === 1) el = el . left;
      if (a . type === 6) {el . setNative (f (a . left)); return true;}
      if (el . type === 6) {a . setNative (rev (el . left)); return true;}
      return false;
    };
  };
  var logical_one_param = function (f) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var a = el . left; el = el . right; if (el . type === 1) el = el . left;
      switch (a . type) {
        case 6: el . setNative (f (a . left)); return true;
        case 3: el . setNative (f (a . left . name)); return true;
        default: break;
      }
      return false;
    };
  };
  var two_params = function (f, rev, esc) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var a = el . left; el = el . right; if (el . type !== 1) return false;
      var n = el . left; el = el . right; if (el . type === 1) el = el . left;
      if (a . type === 6) {
        if (n . type === 6) {el . setNative (f (a . left, n . left)); return true;}
        if (el . type === 6) {n . setNative (rev (a . left, el . left)); return true;}
      }
      if (n . type === 6) {a . setNative (esc (n . left, el . left)); return true;}
    };
  };
  var logical_two_params = function (f) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var a = el . left; if (a . type !== 6) return false;
      el = el . right; if (el . type !== 1) return false;
      var b = el . left; if (b . type !== 6) return false;
      el = el . right; if (el . type === 1) el = el . left;
      el . setNative (f (a . left, b . left)); return true;
    };
  };
  var comparator = function (f) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var first = el . left;
      switch (first . type) {
        case 6: first = first . left; break;
        case 3: first = first . left . name; break;
        default: return false;
      }
      el = el . right;
      while (el . type === 1) {
        var next = el . left;
        switch (next . type) {
          case 6: next = next . left; break;
          case 3: next = next . left . name; break;
          default: return false;
        }
        if (! f (first, next)) return false;
        first = next;
        el = el . right;
      }
      return true;
    };
  };
  var and = new logical_two_params (function (a, b) {return a & b;});
  var or =  new logical_two_params (function (a, b) {return a | b;});
  var xor = new logical_two_params (function (a, b) {return a ^ b;});
  var shiftl = new logical_two_params (function (a, b) {return a << b;});
  var shiftr = new logical_two_params (function (a, b) {return a >> b;});
  var shiftrr = new logical_two_params (function (a, b) {return a >>> b;});
  var neg = new logical_one_param (function (a) {return ~ a;});
  var greater = new comparator (function (a, b) {return a > b;});
  var greater_eq = new comparator (function (a, b) {return a >= b;});
  var less = new comparator (function (a, b) {return a < b;});
  var less_eq = new comparator (function (a, b) {return a <= b;});
  var sub = new function () {
    this . code = function (el) {
      this . code = function (el) {
        if (el . type !== 1) return false;
        var a = el . left; el = el . right;
        if (el . type !== 1) {
          if (a . type === 6) {el . setNative (- a . left); return true;}
          if (el . type === 6) {a . setNative (- el . left); return true;}
          return false;
        }
        var b = el . left; el = el . right;
        if (el . type === 0) {
          if (a . type === 6) {b . setNative (- a . left); return true;}
          if (b . type === 6) {a . setNative (- b . left); return true;}
        }
        if (el . type === 1) el = el . left;
        if (a . type === 6) {
          if (b . type === 6) {el . setNative (a . left - b . left); return true;}
          if (el . type === 6) {n . setNative (a . left - el . left); return true;}
        }
        if (b . type === 6) {a . setNative (b . left + el . left); return true;}
      };
    };
  };
  var comparator_runner = function (f) {
    this . code = function (el) {
      if (el . type !== 1) return false;
      var ret = el . left; el = el . right; if (el . type !== 1) return false;
      var comp = el . left; el = el . right;
      while (el . type === 1) {
        var e = el . left;
        switch (e . type) {
          case 6:
            switch (comp . type) {
              case 6: if (f (comp . left, e . left)) comp = e; break;
              case 3: if (f (comp . left . name, e . left)) comp = e; break;
              default: return false;
            }
            break;
          case 3:
            switch (comp . type) {
              case 6: if (f (comp . left, e . left . name)) comp = e; break;
              case 3: if (f (comp . left . name, e . left . name)) comp = e; break;
              default: return false;
            }
            break;
          default: return false;
        }
        el = el . right;
      }
      ret . type = comp . type;
      ret . left = comp . left;
      return true;
    };
  };
  var rnd = new function () {
    this . code = function (el) {
      var params = [];
      var ret = null;
      while (el . type === 1) {
        switch (el . left . type) {
          case 2: ret = el . left; break;
          case 6: params . push (el . left . left);
          default: break;
        }
        el = el . right;
      }
      if (ret === null) return false;
      switch (params . length) {
        case 0: ret . setNative (Math . random ()); return true;
        case 1: ret . setNative (Math . random () + params [0]); return true;
        case 2: ret . setNative (Math . random () * (params [1] - params [0]) + params [0]); return true;
        default: break;
      }
      return false;
    };
  };
  var stack = function (method) {
    var stacker = function (atom) {
      var q = [];
      this . code = function (el) {
        if (el . type === 0) return atom . setMachine (null);
        while (el . type === 1) {
          var left = el . left;
          if (left . type === 2) {var ell = q [method] (); if (ell === undefined) return false; ell . duplicate (left);}
          else q . push (left);
          el = el . right;
        }
        if (el . type === 2) {
          el . type = 0;
          for (var ind in q) {el . setPair (); q [ind] . duplicate (el . left); el = el . right;}
        }
        return true;
      };
    };
    this . code = function (el) {
      if (el . type === 1) el = el . left;
      if (el . type === 2) el . setAtom (new prolog . Atom ());
      if (el . type !== 3) return false;
      if (el . left . machine !== null) return false;
      return el . left . setMachine (new stacker (el . left));
    };
  };
	var accumulator = new function () {
		var accu = function (atom) {
			var accu = new prolog . Element ();
			this . code = function (el, resolution) {
				if (el . type === 0) return atom . setMachine (null);
				while (el . type === 1) {
					resolution . reset ();
					var e = new prolog . Element ();
					e . type = 1;
					e . left = resolution . match_product (el . left, true);
					e . right = resolution . match_product (accu, false);
					accu = e;
					el = el . right;
				}
				if (el . type === 2) accu . duplicate (el);
				return true;
			};
		};
		this . code = function (el) {
			if (el . type === 1) el = el . left;
			if (el . type === 2) el . setAtom (new prolog . Atom ());
			if (el . type !== 3) return false;
			if (el . left . machine !== null) return false;
			return el . left . setMachine (new accu (el . left));
		};
	};
	var constant = new function () {
		var constantor = function (atom, value) {
			this . code = function (el) {
				if (el . type === 0) return atom . setMachine (null);
				if (el . type === 1) el = el . left;
				value . duplicate (el);
				return true;
			};
		};
		this . code = function (el) {
			if (el . type !== 1) return false;
			var atom = el . left;
			if (atom . type === 2) atom . setAtom (new prolog . Atom ());
			if (atom . type !== 3 || atom . left . machine !== null) return false;
			el = el . right; if (el . type === 1) el = el . left;
			return atom . left . setMachine (new constantor (atom, el));
		};
	};
	var variable = new function () {
		var variabler = function (atom, value) {
			this . code = function (el) {
				if (el . type === 1) {el . left . duplicate (value); return true;}
				if (el . type === 2) {value . duplicate (el); return true;}
				if (el . type === 0) return atom . setMachine (null);
				return false;
			};
		};
		this . code = function (el) {
			var atom = null;
			if (el . type === 1) {atom = el . left; el = el . right; if (el . type === 1) el = el . left;} else atom = el;
			if (atom . type === 2) atom . setAtom (new prolog . Atom);
			if (atom . left . machine !== null) return false;
			return atom . left . setMachine (new variabler (atom, atom === el ? new prolog . Element () : el));
		};
		// [VARIABLE : atom] [VARIABLE atom] [VARIABLE atom : value] [VARIABLE atom value]
	};
	var array = new function () {
		var arrayer = function (atom) {
			var content = {};
			this . code = function (el) {
				if (el . type === 0) return atom . setMachine (null);
				var keys = [];
				var ret = null;
				var key;
				while (el . type === 1) {
					key = el . left;
					switch (key . type) {
						case 6: keys . push (key . left); break;
						case 3: keys . push (key . left . name); break;
						case 2: if (ret !== null) return false; ret = key; break;
						default: return false;
					}
					el = el . right;
				}
				switch (el . type) {
					case 0: break;
					case 6: keys . push (el . left); break;
					case 3: keys . push (el . left . name); break;
					case 2: if (ret !== null) return false; ret = el; break;
					default: return false;
				}
				if (ret !== null) key = keys . pop (); else {ret = key; keys . pop (); key = keys . pop ();}
				var selector = content;
				for (var ind in keys) {
					if (selector [keys [ind]] === undefined) selector = (selector [keys [ind]] = {});
					else selector = selector [keys [ind]];
				}
				if (ret . type === 2) selector [key] . duplicate (ret);
				else selector [key] = ret;
				return true;
			};
		};
		this . code = function (el) {
			if (el . type === 1) el = el . left;
			if (el . type === 2) el . setAtom (new prolog . Atom ());
			if (el . type !== 3 || el . left . machine !== null) return false;
			return el . left . setMachine (new arrayer (el . left));
		};
	};
	var text_list = {
		code: function (el) {
			if (el . type !== 1) return false;
			var text = el . left; el = el . right;
			if (text . type === 2) {
				if (el . type === 1 && el . left . type === 1) el = el . left;
				var ret = [];
				while (el . type === 1) {if (el . left . type === 6) ret . push (Number (el . left . left)); el = el . right;}
				text . setNative (String . fromCharCode . apply (this, ret));
				return true;
			}
			if (text . type === 3) text = text . left . name;
			else if (text . type === 6) text = String (text . left);
			else return false;
			if (el . type === 1) el = el . left;
			el . type = 0;
			for (var ind in text) el = el . setNativePair (text . charCodeAt (ind));
			return true;
		}
	};
	var text_term = {
		code: function (el) {
			if (el . type !== 1) return false;
			var text = el . left;
			el = el . right;
			if (text . type === 6 && typeof (text . left) === 'string') {
				var reader = new prolog . Reader (root, text . left);
				el . type = 0;
				var e = reader . getElement ();
				while (e !== null) {
					el . type = 1;
					el . left = e;
					el . right = new prolog . Element ();
					el = el . right;
					reader . vars = [];
					e = reader . getElement ();
				}
				return true;
			}
			var area = [];
			while (el . type === 1) {area . push (root . getValue (el . left)); el = el . right;}
			text . setNative (area . join (' '));
			return true;
		}
	};
	var e32 = {
		code: function (el) {
			if (el . type !== 1) return false;
			var e = el . left;
			if (e . type === 6) {
				e = Number (e . left);
				if (e === Infinity || e === -Infinity || Number . isNaN (e)) return false;
				el = el . right;
				while (e !== 0) {
					el = el . setNativePair (e & 0xff);
					e = e >>> 8;
				}
				return true;
			}
			el = el . right;
			var accu = 0;
			var shift = 0;
			while (el . type === 1) {
				var sub = el . left;
				if (sub . type === 6) {
					sub = sub . left;
					if (sub === Infinity || sub === -Infinity || Number . isNaN (sub)) return false;
					accu += sub << shift; shift += 8;
				}
				el = el . right;
			}
			e . setNative (accu);
			return true;
		}
	};
	var write = {
		code: function (el) {
			var params = [];
			var accu = []
			while (el . type === 1) {
				var e = el . left;
				if (e . type === 6) accu . push (typeof (e . left) === 'number' ? String . fromCharCode (e . left) : e . left);
				if (e . type === 3) accu . push (e . left . name);
				if (e . type === 2) accu . push ('%c');
				if (e . type === 4) {params . push (accu . join ('')); accu = [];}
				while (e . type === 1) {accu . push (root . getValue (e . left)); e = e . right;}
				el = el . right;
			}
			params . push (accu . join (''));
			root . log . apply (this, params);
			return true;
		}
	};
	var file_writer = new function () {
		var writer = function (atom, file_name) {
			var text = [];
			this . code = function (el) {
				if (el . type === 0) {studio . writeFile (file_name, text . join ('')); return atom . setMachine (null);}
				while (el . type === 1) {
					var e = el . left;
					if (e . type === 6) text . push (typeof (e . left) === 'number' ? String . fromCharCode (e . left) : e . left);
					if (e . type === 3) text . push (e . left . name);
					while (e . type === 1) {text . push (root . getValue (e . left)); e = e . right;}
					el = el . right;
				}
				return true;
			};
		};
		this . code = function (el) {
			var atom = null, file_name = null;
			while (el . type === 1) {
				var left = el . left;
				if (left . type === 3) atom = left;
				if (left . type === 2) {atom = left; atom . setAtom (new prolog . Atom ());}
				if (left . type === 6) file_name = String (left . left);
				el = el . right;
			}
			if (atom === null || file_name === null || atom . left . machine !== null) return false;
			return atom . left . setMachine (new writer (atom . left, file_name));
		};
	};
	var file_reader = new function () {
		var reader = function (atom, content) {
			var fr = new prolog . Reader (root, content);
			this . code = function (el) {
				if (el . type === 0) return atom . setMachine (null);
				while (el . type === 1) {
					var e = fr . getElement ();
					if (e === null) {atom . setMachine (null); return false;}
					e . duplicate (el . left);
					el = el . right;
				}
				return true;
			};
		};
		this . code = function (el) {
			var atom = null, file_name = null;
			while (el . type === 1) {
				var left = el . left;
				if (left . type === 3) atom = left;
				if (left . type === 2) {atom = left; atom . setAtom (new prolog . Atom ());}
				if (left . type === 6) file_name = String (left . left);
				el = el . right;
			}
			if (atom === null || file_name === null || atom . left . machine !== null) return false;
			var content = studio . readFile (file_name);
			if (content === null) return false;
			return atom . left . setMachine (new reader (atom . left, content));
		};
	};
	var create_file = {
		code: function (el) {
			if (el . type !== 1) return false;
			var file_name = el . left; if (file_name . type !== 6) return false; file_name = String (file_name . left);
			el = el . right;
			var text = [];
			while (el . type === 1) {
				var e = el . left;
				if (e . type === 6) text . push (typeof (e . left) === 'number' ? String . fromCharCode (e . left) : e . left);
				if (e . type === 3) text . push (e . left . name);
				while (e . type === 1) {text . push (root . getValue (e . left)); e = e . right;}
				el = el . right;
			}
			studio . writeFile (file_name, text . join (''));
			return true;
		}
	};
	var open_file = {
		code: function (el) {
			if (el . type !== 1) return false;
			var file_name = el . left; if (file_name . type !== 6) return false; file_name = String (file_name . left);
			el = el . right;
			if (el . type === 1) el = el . left;
			var content = studio . readFile (file_name);
			if (content === null) return false;
			el . setNative (content);
			return true;
		}
	};
	var erase_file = {
		code: function (el) {
			if (el . type === 1) el = el . left;
			if (el . type !== 6) return false;
			studio . erase_file (String (el . left));
			return true;
		}
	};
	var importer = function (no_overwrite) {
		this . code = function (el) {
			var command = new prolog . Element ();
			while (el . type === 1) {
				var e = el . left;
				if (e . type === 6) command = root . load (String (e . left), no_overwrite);
				if (command === null) return false;
				el = el . right;
			}
			if (el . type === 2) command . duplicate (el);
			return true;
		};
	};
	var timestamp = {
		code: function (el) {
			if (el . type !== 1) el . setPair ();
			var stamp = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var year = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var month = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var day = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var week_day = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var hour = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var minute = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var second = el . left; el = el . right;
			if (el . type !== 1) el . setPair ();
			var millisecond = el . left;
			if (year . type === 2 || year . type === 0) {
				var date = new Date ();
				if (stamp . type === 6) date . setTime (Number (stamp . left));
				else stamp . setNative (date . getTime ());
				year . setNative (date . getFullYear ());
				month . setNative (date . getMonth () + 1);
				day . setNative (date . getDate ());
				week_day . setNative (date . getDay ());
				hour . setNative (date . getHours ());
				minute . setNative (date . getMinutes ());
				second . setNative (date . getSeconds ());
				millisecond . setNative (date . getMilliseconds ());
				return true;
			}
			var date = new Date ();
			if (year . type === 6) date . setFullYear (Number (year . left));
			if (month . type === 6) date . setMonth (Number (month . left) - 1);
			if (day . type === 6) date . setDate (Number (day . left));
			if (hour . type === 6) date . setHours (Number (hour . left));
			if (minute . type === 6) date . setMinutes (Number (minute . left));
			if (second . type === 6) date . setSeconds (Number (second . left));
			if (millisecond . type === 6) date . setMilliseconds (Number (millisecond . left));
			if (stamp . type !== 6) stamp . setNative (date . getTime ());
			if (year . type !== 6) year . setNative (date . getFullYear ());
			if (month . type !== 6) month . setNative (date . getMonth () + 1);
			if (day . type !== 6) day . setNative (date . getDate ());
			if (week_day . type !== 6) week_day . setNative (date . getDay ());
			if (hour . type !== 6) hour . setNative (date . getHours ());
			if (minute . type !== 6) minute . setNative (date . getMinutes ());
			if (second . type !== 6) second . setNative (date . getSeconds ());
			if (millisecond . type !== 6) millisecond . setNative (date . getMilliseconds ());
			return true;
		}
	};
	var delallcl = {
		code: function (el) {
			if (el . type === 1) el = el . left;
			if (el . type !== 3) return false;
			el = el . left; if (el . Protected || el . machine !== null) return false;
			el . firstClause = null; return true;
		}
	};
	var CL = {
		code: function (el) {
			var atom = null, index = null, clause = null;
			while (el . type === 1) {
				var e = el . left;
				if (e . type === 3) atom = e . left;
				if (e . type === 6) index = e;
				if (e . type === 2) {if (index === null) index = e; else clause = e;}
				if (e . type === 1) clause = e;
				el = el . right;
			}
      if (el . type === 3) atom = el . left;
      if (el . type === 6) index = el;
			if (el . type === 2) {if (index === null) index = el; else if (clause === null) clause = el;}
			if (atom === null || index === null) return false;
      if (clause === null) {index . setNative (atom . clauseCount ()); return true;}
			if (index . type === 6) {
				index = index . left;
				if (typeof (index) !== 'number' || index < 0) return false;
				var cl = atom . raw_clause_pointer (index);
				if (cl === null) return false;
				cl . duplicate (clause);
				clause . left . left . setAtom (atom);
				return true;
			}
			return false;
		}
	};
	var addcl = {
		code: function (el) {
			var index = Number . MAX_VALUE;
			if (el . type === 1 && el . left . type === 6) {index = el . left . left; el = el . right;}
			el = el . duplicate (); if (el . attach (index)) return true; if (el . type !== 1) return false; return el . left . attach (0);
		}
	};
	var addcl0 = {
		code: function (el) {el = el . duplicate (); if (el . attach (0)) return true; if (el . type !== 1) return false; return el . left . attach (0);}
	};
	var DELCL = {
		code: function (el) {
			var atom = null, index = null;
			while (el . type === 1) {
				var e = el . left;
				if (e . type === 6) index = e . left;
				if (e . type === 3) atom = e . left;
				el = el . right;
			}
			if (atom === null || index === null) return false;
			return atom . delcl (index);
		}
	};
  var auto_atoms = {code: function (el) {root . auto_atoms = true; return true;}};
  var scripted_atoms = {code: function (el) {root . auto_atoms = false; return true;}};
  this . getNativeCode = function (name) {
    switch (name) {
      case 'list': return list;
      case 'pp': return pp;
      case 'write': return write;
      case 'file_writer': return file_writer;
      case 'file_reader': return file_reader;
      case 'create_file': return create_file;
      case 'open_file': return open_file;
      case 'erase_file': return erase_file;
      case 'import': return new importer (true);
      case 'load': return new importer (false);
      case 'sum': return sum;
      case 'add': return add;
      case 'sub': return sub;
      case 'mult': return mult;
      case 'times': return new two_params (function (a, b) {return a * b;}, function (a, c) {return c / a;}, function (b, c) {return c / b;});
      case 'div': return new two_params (function (a, b) {return a / b;}, function (a, c) {return a / c;}, function (b, c) {return b * c;});
      case 'mod': return new logical_two_params (function (a, b) {return a % b;});
      case 'e': return new zero_param (Math . E);
      case 'pi': return new zero_param (Math . PI);
      case 'abs': return new logical_one_param (function (a) {return a < 0 ? - a : a;});
      case 'trunc': return new logical_one_param (function (a) {return Math . trunc (a);});
      case 'floor': return new logical_one_param (function (a) {return Math . floor (a);});
      case 'ceil': return new logical_one_param (function (a) {return Math . ceil (a);});
      case 'round': return new logical_one_param (function (a) {return Math . round (a);});
      case 'add1': return add1;
      case 'sub1': return sub1;
      case 'and': return and;
      case 'or': return or;
      case 'xor': return xor;
      case '<<': return shiftl;
      case '>>': return shiftr;
      case '>>>': return shiftrr;
      case 'neg': return neg;
      case 'degrad': return new one_param (function (a) {return a * Math . PI / 180;}, function (a) {return a * 180 / Math . PI;});
      case 'sin': return new one_param (function (a) {return Math . sin (a);}, function (a) {return Math . asin (a);});
      case 'cos': return new one_param (function (a) {return Math . cos (a);}, function (a) {return Math . acos (a);});
      case 'tan': return new one_param (function (a) {return Math . tan (a);}, function (a) {return Math . atan (a);});
      case 'cotan': return new one_param (function (a) {return 1 / Math . tan (a);}, function (a) {return Math . PI / 2 - Math . atan (a);});
      case 'asin': return new one_param (function (a) {return Math . asin (a);}, function (a) {return Math . sin (a);});
      case 'acos': return new one_param (function (a) {return Math . acos (a);}, function (a) {return Math . cos (a);});
      case 'atan': return new one_param (function (a) {return Math . atan (a);}, function (a) {return Math . tan (a);});
      case 'acotan': return new one_param (function (a) {return Math . PI / 2 - Math . atan (a);}, function (a) {return 1 / Math . tan (a);});
      case 'atan2': return new logical_two_params (function (a, b) {return Math . atan2 (a, b);});
      case 'pow': return new two_params (function (a, n) {return Math . pow (a, n);}, function (a, x) {return Math . log (x) / Math . log (a);}, function (n, x) {return Math . pow (x, 1 / n);});
      case 'exp': return new one_param (function (n) {return Math . exp (n);}, function (x) {return Math . log (x);});
      case 'log': return new two_params (function (a, x) {return Math . log (x) / Math . log (a);}, function (a, n) {return Math . pow (a, n);}, function (x, n) {return Math . pow (x, 1 / n);});
      case 'log2': return new one_param (function (x) {return Math . log2 (x);}, function (n) {return Math . pow (2, n);});
      case 'log10': return new one_param (function (x) {return Math . log10 (x);}, function (n) {return Math . pow (10, n);});
      case 'ln': return new one_param (function (x) {return Math . log (x);}, function (n) {return Math . exp (n);});
      case 'greater': return greater;
      case 'greater_eq': return greater_eq;
      case 'less': return less;
      case 'less_eq': return less_eq;
      case 'min': return new comparator_runner (function (a, b) {return a > b;});
      case 'max': return new comparator_runner (function (a, b) {return a < b;});
      case 'rnd': return rnd;
      case 'timestamp': return timestamp;
      case 'delallcl': return delallcl;
      case 'CL': return CL;
      case 'addcl': return addcl;
      case 'addcl0': return addcl0;
      case 'DELCL': return DELCL;
      case 'auto_atoms': return auto_atoms;
      case 'scripted_atoms': return scripted_atoms;
      case 'e32': return e32;
      case 'atom?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 3;}};
      case 'integer?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 6 && Number . isInteger (el . left);}};
      case 'double?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 6 && typeof (el . left) === 'number' && ! Number . isInteger (el . left);}};
      case 'number?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 6 && typeof (el . left) === 'number';}};
      case 'text?': return {code: function (e) {if (el . type === 1) el = el . left; return el . type === 6 && typeof (el . left) === 'string';}};
      case 'var?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 2;}};
      case 'head?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 6;}};
      case 'machine?': return {code: function (el) {if (el . type === 1) el = el . left; return el . type === 3 && el . left . machine !== null;}};
      case 'text_list': return text_list;
      case 'text_term': return text_term;
      case 'CONSTANT': return constant;
      case 'VARIABLE': return variable;
      case 'ACCUMULATOR': return accumulator;
      case 'STACK': return new stack ('pop');
      case 'QUEUE': return new stack ('shift');
      case 'ARRAY': return array;
      default: break;
    }
    return null;
  };
}
);

studio . setResource (['studio.prc'], `
program studio #machine := ' prolog . studio '
	[
    exit list
    pp write
    file_writer file_reader create_file open_file erase_file import load batch
    e pi
    abs trunc floor ceil round
    add1 ++ sub1 --
    and & or | xor ^ neg ~ << >> >>>
    sum times add + sub - mult div mod %
    degrad sin cos tan cotan asin acos atan acotan atan2
    pow exp log log2 log10 ln
    rnd grnd
    greater greater_eq less less_eq > >= => < <= =< min max
    ; I/O
    timestamp
    ; CLAUSE
    delallcl CL cl addcl addcl0 DELCL delcl
    auto_atoms scripted_atoms
    ; TERM
    e32 atom? integer? double? number? text? var? head? machine? text_list text_term
    ; META
    CONSTANT VARIABLE var ACCUMULATOR STACK QUEUE ARRAY
    eq = <> !
    ONE TRY PROBE SELECT LENGTH AT ONLIST INLIST NODUP
    ALL APPEND REVERSE MAP MEMBER REPLACE
    WHILE FOREVER forever REPEAT FOR IF inc dec
    ISALL isall isallq isallr
    not res
	]

#machine list := 'list'
#machine pp := 'pp'
#machine write := 'write'
#machine file_writer := 'file_writer'
#machine file_reader := 'file_reader'
#machine create_file := 'create_file'
#machine open_file := 'open_file'
#machine erase_file := 'erase_file'
#machine import := 'import'
#machine load := 'load'

#machine e := 'e'
#machine pi := 'pi'
#machine abs := 'abs'
#machine trunc := 'trunc'
#machine floor := 'floor'
#machine ceil := 'ceil'
#machine round := 'round'
#machine add1 := 'add1'
#machine ++ := 'add1'
#machine sub1 := 'sub1'
#machine -- := 'sub1'
#machine sum := 'sum'
#machine add := 'add'
#machine + := 'add'
#machine sub := 'sub'
#machine - := 'sub'
#machine mult := 'mult'
#machine times := 'times'
#machine div := 'div'
#machine mod := 'mod'
#machine % := 'mod'

#machine and := 'and'
#machine & := 'and'
#machine or := 'or'
#machine | := 'or'
#machine xor := 'xor'
#machine ^ := 'xor'
#machine << := '<<'
#machine >> := '>>'
#machine >>> := '>>>'
#machine neg := 'neg'
#machine ~ := 'neg'

#machine degrad := 'degrad'
#machine sin := 'sin'
#machine cos := 'cos'
#machine tan := 'tan'
#machine cotan := 'cotan'
#machine asin := 'asin'
#machine acos := 'acos'
#machine atan := 'atan'
#machine acotan := 'acotan'
#machine atan2 := 'atan2'

#machine pow := 'pow'
#machine exp := 'exp'
#machine log := 'log'
#machine log2 := 'log2'
#machine log10 := 'log10'
#machine ln := 'ln'

#machine rnd := 'rnd'

#machine greater := 'greater'
#machine > := 'greater'
#machine greater_eq := 'greater_eq'
#machine >= := 'greater_eq'
#machine => := 'greater_eq'
#machine less := 'less'
#machine < := 'less'
#machine less_eq := 'less_eq'
#machine <= := 'less_eq'
#machine =< := 'less_eq'
#machine min := 'min'
#machine max := 'max'

#machine timestamp := 'timestamp'

#machine delallcl := 'delallcl'
#machine CL := 'CL'
#machine addcl := 'addcl'
#machine addcl0 := 'addcl0'
#machine DELCL := 'DELCL'
#machine auto_atoms := 'auto_atoms'
#machine scripted_atoms := 'scripted_atoms'

#machine e32 := 'e32'
#machine atom? := 'atom?'
#machine integer? := 'integer?'
#machine double? := 'double?'
#machine number? := 'number?'
#machine text? := 'text?'
#machine var? := 'var?'
#machine head? := 'head?'
#machine machine? := 'machine?'
#machine text_list := 'text_list'
#machine text_term := 'text_term'

#machine CONSTANT := 'CONSTANT'
#machine VARIABLE := 'VARIABLE'
#machine ACCUMULATOR := 'ACCUMULATOR'
#machine STACK := 'STACK'
#machine QUEUE := 'QUEUE'
#machine ARRAY := 'ARRAY'

[[eq *x *x]]
[[= *x *x]]
[[<> *x *x] / fail]
[[<> * *]]
[[! : *x] *x / fail]
[[! : *]]
[[not : *x] *x / fail]
[[not : *]]
[[res : *command] : *command]
[[ONE :*o][res :*o]/]
[[ALL :*o][res : *o] fail]
[[ALL :*]]
[[TRY :*o]:*o]
[[TRY :*o]]
[[PROBE :*o][ONE :*o] fail]
[[PROBE :*o]]
[[SELECT] / fail]
[[SELECT *branch : *] : *branch]
[[SELECT * : *branches] / [SELECT : *branches]]
[[APPEND [] *l *l]]
[[APPEND [*head : *tail] *l [*head : *new]]/
	[APPEND *tail *l *new]]
[[LENGTH [] 0]]
[[LENGTH [*head : *tail] *length] [LENGTH *tail *l] [sum *l 1 *length]]
[[AT *from *from *e [*e : *]]]
[[AT *from *to *e [* : *list]] [++ *from *next] / [AT *next *to *e *list]]
[[AT *index *element *list] / [AT 0 *index *element *list]]
[[ONLIST *x [*x : *]]]
[[ONLIST *x [* : *l]] [ONLIST *x *l]]
[[INLIST *l *x [*x : *l]]]
[[INLIST [*h : *l] *x [*h : *ll]] [INLIST *l *x *ll]]
[[NODUP [] []]/]
[[NODUP [*x : *t] *result] [ONLIST *x *t] / [NODUP *t *result]]
[[NODUP [*x : *t] [*x : *result]] / [NODUP *t *result]]
[[MAP [] [] []]]
[[MAP [[*x *y] : *xyt] [*x : *xt] [*y : *yt]] / [MAP *xyt *xt *yt]]
[[MEMBER *x [*x : *]]]
[[MEMBER *x [* : *l]] [MEMBER *x *l]]
[[REPLACE *x [*x : *l] *l]]
[[REPLACE *x [*h : *l] [*h : *ll]] [REPLACE *x *l *ll]]
[[REPLACE *x [*x : *l] *y [*y : *l]]]
[[REPLACE *x [*h : *l] *y [*h : *ll]] [REPLACE *x *l *y *ll]]
[[WHILE *condition : *call] [not not : *condition] / [PROBE : *call] / [WHILE *condition : *call]]
[[WHILE : *]]
[[FOREVER : *instructions] [PROBE : *instructions] / [FOREVER : *instructions]]
[[forever : *instructions] [res : *instructions] / [forever : *instructions]]
[[REPEAT *ind : *instructions] [less 0 *ind] [PROBE : *instructions] [sub1 *ind *next] / [REPEAT *next : *instructions]]
[[REPEAT : *]]
[[FOR * [] : *] /]
[[FOR *head [*head : *] : *call] [ONE : *call] fail]
[[FOR *head [* : *tail] : *call] / [FOR *head *tail : *call]]
[[FOR *index *index *index *step : *call] [TRY : *call]/]
[[FOR *index *index *to *step : *call] [ONE : *call] fail]
[[FOR *index *from *to *step : *call]
	[add *from *step *next] /
	[FOR *index *next *to *step : *call]]
[[IF *condition *then] *condition / [TRY *then] /]
[[IF *condition *then] /]
[[IF *condition *then *else] *condition / [TRY *then] /]
[[IF *condition *then *else] [TRY *else] /]
[[REVERSE *l1 *l2] [REVERSE *l1 [] *l2]]
[[REVERSE [] *x *x]]
[[REVERSE [*head : *tail] *l0 *list] [REVERSE *tail [*head : *l0] *list]]
[[var]]
[[var *var : *vars] [var? *var] / [VARIABLE *var] / [var : *vars]]
[[var [*var *value] : *vars] / [VARIABLE *var *value] / [var : *vars]]
[[var *var : *vars] [VARIABLE *var] / [var : *vars]]
[[inc *var] [*var : *value] [add *value 1 *new] [*var *new]]
[[inc *var *inc] [*var : *value] [add *value *inc *new] [*var *new]]
[[dec *var] [*var : *value] [sub *value 1 *new] [*var *new]]
[[dec *var *dec] [*var : *value] [sub *value *dec *new] [*var *new]]

[[ISALL *atom *template : *call]
	[res : *call]
	[*atom *template] fail
]
[[ISALL : *]]

[[isall *list *template : *call]
	[ACCUMULATOR *atom]
	[ISALL *atom *template : *call]
	[*atom : *list] /
]

[[isallq *list *template : *call]
	[QUEUE *atom]
	[ISALL *atom *template : *call]
	[*atom : *list] /
]

[[isallr *list *template : *call]
	[ACCUMULATOR *atom]
	[ISALL *atom *template : *call]
	[*atom : *reversed_list]
	[REVERSE *reversed_list *list] /
]


[[grnd : *command] [rnd : *command]]
[[grnd : *command] / [grnd : *command]]

[[batch *text] [file_reader *text *batch] [batch [batch] *batch]]
[[batch [exit] *batch] [*batch] /]
[[batch * *batch] [*batch *command] *command / [batch *command *batch]]
[[batch * *batch] [*batch] / fail]

[[cl *x] / [cl 0 *y *x]]
[[cl *x *y] / [cl 0 *x *y]]
[[cl *x *x [[*a:*b]:*c]] [CL *x *a [[*a:*b]:*c]]]
[[cl *x *y [[*a:*b]:*c]] [add *x 1 *x2] / [CL *x2 *a *X] [cl *x2 *y [[*a:*b]:*c]]]
[[delcl [[*a:*b]:*c]] [cl *x [[*a:*b]:*c]] [DELCL *x *a]]

[[exit : *]]

end .
`);
