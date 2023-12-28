import ipaddress
from .enums import AccessLevel
from models.config import ServerSecurityAccessLevelsConfig


def in_net_or_address(host: str, net: str) -> bool:
    if net == "*":
        return True
    if "/" in net:
        return ipaddress.ip_address(host) in ipaddress.ip_network(net)
    return host == net


def calculate_access_level(
    host: str, access_levels: ServerSecurityAccessLevelsConfig
) -> AccessLevel:
    for net in access_levels.internal:
        if in_net_or_address(host, net):
            return AccessLevel.INTERNAL

    for net in access_levels.privileged:
        if in_net_or_address(host, net):
            return AccessLevel.PRIVILEGED

    for net in access_levels.external:
        if in_net_or_address(host, net):
            return AccessLevel.EXTERNAL

    return AccessLevel.FORBIDDEN
