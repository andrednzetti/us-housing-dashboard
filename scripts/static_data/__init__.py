"""
Static datasets exibidos no dashboard que ainda não vêm de scrape automático.

Implementação inicial: hardcoded a partir do mock do Handoff (Variação D).
Substituição por scrape NAR/Realtor.com fica para fase posterior, fora
do escopo desta migração.
"""

from .regions import REGIONS
from .metros import METROS

__all__ = ["REGIONS", "METROS"]
