/*
TERMS OF NON-COMMERCIAL USE    

NON-COMMERCIAL USE ONLY: By downloading this software you agree to use the software contained herein for internal, non-commercial research, evaluation or testing purposes only. Any use of the data generated by the software or its contents to manufacture or sell products or technologies (or portions thereof) either directly or indirectly for any direct or indirect for-profit purposes is strictly prohibited. Subject to the above conditions, this software is provided under the BSD-3 license, a copy of which is contained with the source or object code files downloaded. 

CITATION: By downloading this software you agree to reference the publication Skin Microstructure Deformation with Displacement Map Convolution (http://gl.ict.usc.edu/Research/SkinStretch/) and acknowledge Koki Nagano, Graham Fyffe, Oleg Alexander, Jernej Barbic, Hao Li, Abhijeet Ghosh, and Paul Debevec as the source of the software and any data generated in any publications reporting use of it or any manual or document. A copy of all reports and papers that are for public or general release that use the data generated must be forwarded immediately upon release or publication to Kathleen Haase (Haase@ict.usc.edu).
*/

//version 1.0
//2017.03.22
//Koki Nagano
//koki.nagano0219@gmail.com
//GLSL shader to compute per-pixel anisotropic stretch.

/*
** varying
*/
varying vec2 Tr0;
varying vec2 Tr1;

/*
** attribute
*/
//pass in 2x2 linear transformation matrix T in equation (10) already computed in CPU as vertex attributes 
attribute vec2 _Tr0;//1st row of T
attribute vec2 _Tr1;//2nd row of T

void main() 
{
	Tr0 = _Tr0;
	Tr1 = _Tr1;

	gl_TexCoord[0] = gl_MultiTexCoord0;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}