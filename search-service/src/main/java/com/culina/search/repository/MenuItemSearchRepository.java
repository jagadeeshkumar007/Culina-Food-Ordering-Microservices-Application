package com.culina.search.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.culina.search.document.MenuItemDocument;

public interface MenuItemSearchRepository extends ElasticsearchRepository<MenuItemDocument, Long> {
}
