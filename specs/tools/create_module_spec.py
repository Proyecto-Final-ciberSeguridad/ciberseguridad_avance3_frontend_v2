#!/usr/bin/env python3
"""
create_module_spec.py - Herramienta de asistencia para Spec-Driven Development (SDD)
en Santa Fe Capacita.

Extrae texto de documentos .docx de teoría y cuestionarios para asistir
en la generación de la especificación técnica de un nuevo módulo.
"""

import sys
import os
import argparse

try:
    import docx
except ImportError:
    print("Error: python-docx no está instalado. Ejecutar: pip install python-docx o sudo apt install python3-docx", file=sys.stderr)
    sys.exit(1)


def read_docx_paragraphs(file_path):
    if not os.path.isfile(file_path):
        return []
    doc = docx.Document(file_path)
    return [p.text.strip() for p in doc.paragraphs if p.text.strip()]


def inspect_theory(file_path):
    paragraphs = read_docx_paragraphs(file_path)
    total_words = sum(len(p.split()) for p in paragraphs)
    total_chars = sum(len(p) for p in paragraphs)
    # Estimación de carillas estándar (aprox. 450-500 palabras por carilla)
    est_pages = total_words / 450.0

    print(f"\n📄 Inspección de Teoría: {os.path.basename(file_path)}")
    print(f"   • Párrafos con contenido: {len(paragraphs)}")
    print(f"   • Palabras totales: {total_words}")
    print(f"   • Estimación de carillas: ~{est_pages:.1f} páginas")
    if est_pages > 10:
        print(f"   ⚠️ ALERTA RNF: Supera las 10 carillas. Requiere síntesis en la Spec para la web.")
    else:
        print(f"   ✅ Cumple con el límite acordado con la cátedra (<10 carillas).")
    return paragraphs


def inspect_quiz(file_path):
    paragraphs = read_docx_paragraphs(file_path)
    print(f"\n❓ Inspección de Cuestionario: {os.path.basename(file_path)}")
    print(f"   • Párrafos de preguntas/opciones: {len(paragraphs)}")
    return paragraphs


def main():
    parser = argparse.ArgumentParser(description="Helper para extraer y analizar insumos de módulos (.docx)")
    parser.add_argument("--module", "-m", type=int, required=True, help="Número de módulo (2, 3 o 4)")
    parser.add_argument("--theory", "-t", type=str, help="Ruta al archivo .docx de teoría")
    parser.add_argument("--quiz", "-q", type=str, help="Ruta al archivo .docx del cuestionario")
    args = parser.parse_args()

    default_doc_dir = "/home/tomy/apps/documentacionpf"
    
    theory_path = args.theory
    if not theory_path and os.path.isdir(default_doc_dir):
        # Búsqueda automática
        mod_prefix = f"Modulo {args.module}"
        theory_dir = os.path.join(default_doc_dir, "Modulos de teoria")
        if os.path.isdir(theory_dir):
            for f in os.listdir(theory_dir):
                if f.startswith(mod_prefix) or f.startswith(f"Módulo {args.module}"):
                    theory_path = os.path.join(theory_dir, f)
                    break

    quiz_path = args.quiz
    if not quiz_path and os.path.isdir(default_doc_dir):
        quiz_dir = os.path.join(default_doc_dir, "Cuestionarios")
        if os.path.isdir(quiz_dir):
            for f in os.listdir(quiz_dir):
                if f" {args.module}" in f or f"{args.module}." in f or f"modulo {args.module}" in f.lower():
                    quiz_path = os.path.join(quiz_dir, f)
                    break

    print(f"==================================================")
    print(f"🚀 SDD Module Creator - Asistente para Módulo {args.module}")
    print(f"==================================================")

    if theory_path and os.path.exists(theory_path):
        inspect_theory(theory_path)
    else:
        print(f"ℹ️ No se especificó o no se encontró archivo de teoría para el módulo {args.module}.")

    if quiz_path and os.path.exists(quiz_path):
        inspect_quiz(quiz_path)
    else:
        print(f"ℹ️ No se especificó o no se encontró archivo de cuestionario para el módulo {args.module}.")

    print("\n💡 Próximo paso: Copiar 'specs/modules/template.spec.md' a 'specs/modules/module-{}.spec.md' y completar los campos.".format(args.module))


if __name__ == "__main__":
    main()
