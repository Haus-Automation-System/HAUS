import ipaddress
from .enums import AccessLevel
from models.config import ServerSecurityAccessLevelsConfig


def normalize_address(addr: str) -> ipaddress.IPv4Address:
    _host = ipaddress.ip_address(addr)
    if isinstance(_host, ipaddress.IPv6Address) and _host.ipv4_mapped:
        _host = _host.ipv4_mapped

    return _host


def in_net_or_address(host: str, net: str) -> bool:
    _host = normalize_address(host)

    if net == "*":
        return True
    if "/" in net:
        return _host in ipaddress.ip_network(net)
    return _host == ipaddress.ip_address(net)


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
