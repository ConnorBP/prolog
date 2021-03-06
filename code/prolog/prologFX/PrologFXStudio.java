///////////////////////////////////////////////////////////////////////////////////
//                       Copyright (C) 2016 Robert P. Wolf                       //
//                                                                               //
// Permission is hereby granted, free of charge, to any person obtaining a copy  //
// of this software and associated documentation files (the "Software"), to deal //
// in the Software without restriction, including without limitation the rights  //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell     //
// copies of the Software, and to permit persons to whom the Software is         //
// furnished to do so, subject to the following conditions:                      //
//                                                                               //
// The above copyright notice and this permission notice shall be included in    //
// all copies or substantial portions of the Software.                           //
//                                                                               //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     //
// THE SOFTWARE.                                                                 //
///////////////////////////////////////////////////////////////////////////////////

package prologFX;

import prolog . *;

import java . io . File;
import java . io . FileInputStream;
import java . io . FileOutputStream;
import java . util . List;
import java . util . concurrent . CountDownLatch;

import javafx . application . Platform;
import javafx . stage . FileChooser;

class fx_start extends PrologNativeCode {
	public PrologRoot root = null;
	public java . io . PrintStream oout = null;
	public boolean code (PrologElement parameters, PrologResolution resolution) {PrologMainFX . activate (root, oout); return true;}
	public fx_start (PrologRoot root, java . io . PrintStream oout) {this . root = root; this . oout = oout;}
}

class fx_stop extends PrologNativeCode {
	public boolean code (PrologElement parameters, PrologResolution resolution) {PrologMainFX . stop_fx (); return true;}
}

class file_reader_chooser extends PrologNativeCode {
	public PrologRoot root;
	public boolean code (PrologElement parameters, PrologResolution resolution) {
		FileChooser f = new FileChooser ();
		final CountDownLatch latch = new CountDownLatch (1);
		final PrologElement p = parameters;
		Platform . runLater (new Runnable () {
			public void run () {
				List <File> files = f . showOpenMultipleDialog (PrologMainFX . stage);
				if (files != null) {
					PrologElement parameters = p;
					for (File f : files) {
						if (! parameters . isPair ()) parameters . setPair ();
						PrologElement el = parameters . getLeft ();
						if (! el . isAtom ()) el . setAtom (new PrologAtom ());
						PrologAtom a = el . getAtom ();
						if (a . getMachine () == null) try {a . setMachine (new prolog . studio . FileReader (a, root, new FileInputStream (f)));} catch (Exception ex) {}
						parameters = parameters . getRight ();
					}
				}
				latch . countDown ();
			}
		});
		try {latch . await ();} catch (Exception ex) {}
		return true;
	}
	public file_reader_chooser (PrologRoot root) {this . root = root;}
}

class file_writer_chooser extends PrologNativeCode {
	public PrologRoot root;
	public boolean code (PrologElement parameters, PrologResolution resolution) {
		FileChooser f = new FileChooser ();
		final CountDownLatch latch = new CountDownLatch (1);
		final PrologElement p = parameters;
		Platform . runLater (new Runnable () {
			public void run () {
				File file = f . showSaveDialog (PrologMainFX . stage);
				if (file != null) {
					PrologElement parameters = p;
					if (! parameters . isPair ()) parameters . setPair ();
					parameters = parameters . getLeft ();
					if (! parameters . isAtom ()) parameters . setAtom (new PrologAtom ());
					PrologAtom a = parameters . getAtom ();
					if (a . getMachine () == null) try {a . setMachine (new prolog . studio . FileWriter (a, root, new FileOutputStream (file)));} catch (Exception ex) {}
				}
				latch . countDown ();
			}
		});
		try {latch . await ();} catch (Exception ex) {}
		return true;
	}
	public file_writer_chooser (PrologRoot root) {this . root = root;}
}

class fxedit_class extends PrologNativeCode {
	public boolean code (PrologElement parameters, PrologResolution resolution) {
		PrologElement file_name = null;
		while (parameters . isPair ()) {PrologElement el = parameters . getLeft (); if (el . isText ()) file_name = el; parameters = parameters . getRight ();}
		if (parameters . isText ()) file_name = parameters;
		PrologMainFX . fxedit_command (file_name == null ? null : file_name . getText ());
		return true;
	}
}

class fxsave_class extends PrologNativeCode {
	public boolean code (PrologElement parameters, PrologResolution resolution) {
		PrologElement file_name = null;
		while (parameters . isPair ()) {PrologElement el = parameters . getLeft (); if (el . isText ()) file_name = el; parameters = parameters . getRight ();}
		if (parameters . isText ()) file_name = parameters;
		return PrologMainFX . fxsave_command (file_name == null ? null : file_name . getText ());
	}
}

public class PrologFXStudio extends PrologServiceClass {
	public PrologRoot root;
	public PrologDirectory directory;
	public java . io . PrintStream oout;
	public String android_path = "";
	public void init (PrologRoot root, PrologDirectory directory) {
		this . root = root; this . directory = directory;
		java . io . PipedInputStream pipedInput = new java . io . PipedInputStream ();
		java . io . PipedOutputStream pipedOutput = new java . io . PipedOutputStream ();
		oout = new java . io . PrintStream (pipedOutput);
		try {pipedInput . connect (pipedOutput);} catch (Exception ex) {ex . printStackTrace ();}
		root . insertReader (pipedInput);
		try {root . pwd = android . os . Environment . getExternalStorageDirectory () . toString ();} catch (Error e) {}
	}
	public PrologNativeCode getNativeCode (String name) {
		if (name . equals ("fx_start")) return new fx_start (root, oout);
		if (name . equals ("fx_stop")) return new fx_stop ();
		if (name . equals ("file_reader_chooser")) return new file_reader_chooser (root);
		if (name . equals ("file_writer_chooser")) return new file_writer_chooser (root);
		if (name . equals ("fxedit")) return new fxedit_class ();
		if (name . equals ("fxsave")) return new fxsave_class ();
		return null;
	}
}
